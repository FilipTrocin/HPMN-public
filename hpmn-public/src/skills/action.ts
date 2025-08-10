import { v4 } from "uuid";

import { currentDate } from "../logic/thinking";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { call } from "../ai/llm";
import { actionSelectionParser, ActionSelectionResult } from "../ai/parsers/actionSelection";
import { loadConfigFile } from "../utils/helpers";
import { getConfig } from "../utils/config";
import { getLogger } from "../utils/logger";
import { 
    getDatabaseClient, 
    getVectorStore, 
    upsertVector, 
    getDefaultActions 
} from "../database/interfaces";
import { callWorkflow } from "../integrations/workflow";

const log = getLogger('SKILLS.ACTION');

/**
 * Execute an action based on the user's query and context
 * 
 * @param query - User's input query
 * @param embedding - Query embedding vector
 * @param context - Additional context for action execution
 * @param config - Configuration object
 * @param conversationId - Conversation ID for tracking
 * @returns Action execution result
 */
export const performAction = async (
    query: string, 
    embedding: number[], 
    context: any, 
    config: any, 
    conversationId: string
) => {
    // 0. Check if actions table is empty and populate if needed
    const dbClient = getDatabaseClient();
    const existingActions = await dbClient.getActions();
    
    if (existingActions.length === 0) {
        log.info('Actions table is empty. Initialising with default actions...');
        
        // Run action creation sequentially to avoid race conditions
        for (const action of getDefaultActions()) {
            await addAction({
                uuid: action.id,
                name: action.title,
                description: action.description,
                schema: action.schema,
                webhook: action.webhook,
                tags: action.tags
            }, false);
        }

        log.info('Default actions initialised.');
    }
    
    // 1. Find candidate actions via vector search
    const vectorStore = getVectorStore();
    const searchResults = await vectorStore.search('actions', {
        vector: embedding,
        limit: 5,
        with_payload: true
    });

    // 2. Fetch full action details from database
    const actionPromises = searchResults.map(hit => findAction(hit.id as string));
    const potentialActions = (await Promise.all(actionPromises)).filter(Boolean);

    if (potentialActions.length === 0) {
        log.error('No actions found in vector store');
        return {action: 'Unknown', data: 'Action not found.', status: 'error'};
    }
    
    // 3. Load action selection schema
    const actionSelectionSchemas = loadConfigFile('action_selection', 'md', 'ai/prompts/inner_api');

    log.info(`Selecting action from: ${potentialActions.map(a => a.name).join(', ')}`);

    // 4. Prepare system prompt with available actions context
    const contextContent = context && context.length > 0 
        ? context.map((doc: any) => doc[0].pageContent).join('\n\n')
        : "No relevant context memories found.";
    const availableActionsContext = potentialActions.map(action => {
        try {
            const schema = JSON.parse(action.content || '{}');
            return `- ${action.name}: ${schema.description || 'No description available'}`;
        } catch (e) {
            log.error(`Error parsing schema for action "${action.name}": ${e}`);
            return `- ${action.name}: Action schema parsing failed`;
        }
    }).join('\n');

    log.info(`Available actions: ${availableActionsContext}`);
    log.info(`Context: ${contextContent}`);

    // 4. Use OutputParser for action selection
    log.info('Selecting action using OutputParser');
    
    const appConfig = getConfig();
    const result: ActionSelectionResult = await call(
        [], // messages not used in OutputParser mode
        { 
            modelName: appConfig.services.openai.model, 
            provider: 'openai', 
            providerApiKey: appConfig.services.openai.apiKey,
            temperature: 0.2 // Lower temperature for more consistent selection
        }, 
        null, // no interaction needed
        {
            parser: actionSelectionParser,
            promptTemplate: 'action_selection',
            promptVars: {
                available_actions: availableActionsContext,
                context: contextContent,
                current_time: currentDate(),
                query: query
            }
        }
    );

    if (!result || !result.action_name) {
        log.error('LLM did not select an action.');
        return {action: 'Unknown', data: 'Could not determine an action to take.', status: 'error'};
    }

    const skill = potentialActions.find(action => action.name === result.action_name);

    if (!skill) {
        log.error(`LLM chose action "${result.action_name}" but it could not be found.`);
        return {action: 'Unknown', data: 'Action not found.', status: 'error'};
    }

    log.info(`⚡ Selected action: "${skill.name}" \nwith confidence: ${result.confidence} \nReasoning: ${result.reasoning}`);

    try {
        // 5. Execute the chosen action
        const response = await callWorkflow({
            url: skill.url,
            method: 'GET',
            params: {
                query,
                conversationId,
                ...result.extracted_parameters
            }
        });
        
        log.info('Action "' + skill.name + '" executed successfully!');
        return {action: skill.name, data: response, status: 200};
    } catch (error) {
        log.error(`Action "${skill.name}" failed: ${error}`);
        return {action: skill.name, data: 'Remote action failed.', status: 'error'};
    }
}

/**
 * Find an action by its UUID in the database
 * 
 * @param uuid - The UUID of the action to find
 * @returns The action record if found, otherwise null
 */
export const findAction = async (uuid: string) => {
    try {
        const dbClient = getDatabaseClient();
        return await dbClient.getAction(uuid);
    } catch (error) {
        log.error('Action "' + uuid + '" could not be retrieved from database');
        return null;
    }
}

/**
 * Add a new action to the system
 * 
 * @param data - Action data to add
 * @param synced - Whether the action is already synced to vector store
 * @returns The created action record
 */
export const addAction = async (data: any, synced = false) => {
    const uuid = data?.uuid || v4();
    const dbClient = getDatabaseClient();
    
    const action = await dbClient.createAction({
        id: uuid,
        name: data.name,
        content: JSON.stringify(data.schema),
        url: data.webhook,
        tags: data.tags,
        active: true,
        category: 'default'
    });

    if (!synced) {
        await upsertVector(
            'actions',
            uuid,
            data.name + ': ' + data.description,
            data.name,
            { 
                tags: data.tags,
                url: data.webhook
            }
        );
    }

    return action;
}
