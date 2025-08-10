import { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { call } from "../ai/llm";
import { intentRecognitionParser, IntentRecognitionResult } from "../ai/parsers/intentRecognition";
import { loadConfigFile } from "../utils/helpers";
import { getConfig } from "../utils/config";
import { getLogger } from "../utils/logger";

const log = getLogger('LOGIC.THINKING');

// Default values for document properties, if not provided
const DOC_TITLE = 'Unnamed Document';
const DOC_ID = 'unknown-id';


// ============= Intent Recognition =============

/**
 * Categorise user queries into intent (action or query) and category based on information required.
 * 
 * @param query - User's input query to categorise
 * @param conversation - Previous conversation history
 * @returns Intent recognition result with type, category, and summary
 */
export const intentRecognition = async (query: string, conversation: any[] = []): Promise<IntentRecognitionResult> => {
    const config = getConfig();

    // Convert conversation messages into a plain-text transcript for the prompt
    const conversationString = conversation
        .map((msg: any) => {
            try {
                // _getType() exists on LangChain messages and returns "human" | "ai" | "system"
                const role = (typeof msg._getType === 'function') ? msg._getType() : (msg.role ?? '');
                return `${role.toUpperCase()}: ${msg.content}`;
            } catch {
                return String(msg?.content || '');
            }
        })
        .join('\n');

    const result = await call(
        [], // messages not used in OutputParser mode
        {
            modelName: config.services.openai.model,
            provider: 'openai',
            providerApiKey: config.services.openai.apiKey,
            temperature: 0.2 // Lower temperature for more consistent categorisation
        },
        null, // no interaction needed
        {
            parser: intentRecognitionParser,
            promptTemplate: 'intent_recognition',
            promptVars: {
                query: query,
                conversation: conversationString
            }
        }
    );

    log.info(`Intent recognised: type=${result.type}, category=${result.category}, summary="${result.summary}"`);
    return result;
}

// ============= Response Generation =============

/**
 * Preparing a response based on 1) User query, 2) Conversation history, 3) Context.
 * This is a high-level method that handles the conversation logic.
 * 
 * Use this method when you:
 * - Need to generate a natural conversation response, incorporating the assistant's personality.
 * - Want to include conversation history and context, making the interaction more coherent.
 * - Need the system prompt with assistant's personality, setting the tone and style of the conversation.
 * - Don't need function calling or special LLM configurations.
 * 
 * @param query - User's input query
 * @param conversation - Previous conversation history
 * @param context - Additional context for response
 * @returns Response configuration
 */
export const respond = async (query: string, conversation: any[], context?: any): Promise<any> => {
    
    let messages = [
        new SystemMessage(await _generateSystemPrompt(query, context)),
        ...conversation,
        new HumanMessage(query)
    ];

    log.debug('System and Human prompts prepared for LLM to respond');
    return { messages };
}

/**
 * Generate the system prompt for response generation using template
 * 
 * @param query - User's input query
 * @param context - Additional context for response. The context can be action-type and then you pass actionName, actionStatus and actionResponse or memories-type and then you pass memories.
 * @returns Promise<string> System prompt
 */
const _generateSystemPrompt = async (query: string, context?: any): Promise<string> => {
    const template = loadConfigFile('assistant_final_answer', 'md', 'ai/prompts/inner_api');
    
    // Build context string based on available context
    let contextString = '';
    
    if (context?.actionName) {
        contextString = `
        There was an action that just happened and I will paraphrase in a very natural way the response I got from it.
        ###
        Name: ${context.actionName}
        Status: ${context.actionStatus}
        Response: ${context.actionResponse}
        ###`;
    }

    if (context?.memories?.length) {
        contextString = `
        \n\n"""${context.memories.map((item: [{ metadata: { name?: string; title?: string; header?: string; tags?: string[]; context?: string }; pageContent: string }, number]) => {
            // Extract the document from the tuple [Document, score]
            const doc = item[0];
            let memoryString = '\nMEMORY TITLE: "' + (doc.metadata?.header || doc.metadata?.title || doc.metadata?.name || DOC_TITLE) + '"';
            
            // Add context if available
            if (doc.metadata?.context) {
                memoryString += '\nCONTEXT: "' + doc.metadata.context + '"';
            }
            
            // Add tags if available
            if (doc.metadata?.tags && doc.metadata.tags.length > 0) {
                memoryString += '\nTAGS: [' + doc.metadata.tags.join(', ') + ']';
            }
            
            memoryString += '\nCONTENTS:\n' + doc.pageContent + '\n\n';

            return memoryString;
        }).join('\n\n')}"""`;
    }
    
    // Format the prompt using the template
    const formattedPrompt = await template.format({
        context: contextString,
        time: currentDate(),
        question: query
    });

    log.info("---------FINAL RESPONSE OF ASSISTANT--------");
    log.info(`${formattedPrompt}`);

    return formattedPrompt;
}

// ============= Document Reranking =============

/**
 * Semantic relevance check of the query against the documents performed by LLM. Accurate, but expensive operation, as it's using the model.
 * 
 * @param query - The user's input query
 * @param config - Configuration object for the OpenAI model
 * @param documents - Array of [Document, score] tuples from recall function. Each document must have its UUID and come 
 *                    from the database (e.g. memories, actions, notes, etc.) tables. 
 *                    All elements from the table are being taken and will be ranked based on their relevancy to the query.
 * @returns Array of [Document, score] tuples, filtered and reranked by relevance
 */
export const rerank = async (query: string, config: any, documents: [Document, number][]) => {
    log.info(`Starting semantic reranking of ${documents.length} documents from vector search`);

    const appConfig = getConfig();
    
    // Check the relevance of each document against the query
    const checks = await Promise.all(
        documents.map(async ([doc, score]) => {
            const docTitle = doc.metadata?.title || DOC_TITLE;
            const docId = doc.metadata?.id || DOC_ID;
            log.debug(`Vector search classified doc ${docId} relevant in ${score.toFixed(4)}%`);
            
            const result = await _checkDocumentRelevance(doc, query, {
                modelName: config.modelName,
                providerApiKey: config.apiKey || appConfig.services.openai.apiKey,
                temperature: config.temperature,
            });
            log.info(`Document "${docTitle}" (${docId}) got semantic relevance score: ${result}`);
            return {
                id: docId,
                title: docTitle,
                rank: result,
                vectorScore: score
            };
        })
    );

    // Filter documents to retain only those that are relevant
    const relevantDocs = documents.filter(([doc, score]) => {
        const docTitle = doc.metadata?.title || DOC_TITLE;
        const docId = doc.metadata?.id || DOC_ID;
        
        const check = checks.find(check => check.id === docId && check.rank === '1');
        
        if (check) {
            log.debug(`Document "${docTitle}" (ID: ${docId}) is being kept`);
            log.debug("All other documents are being filtered out");
        }
        
        return check;
    });

    const passedDocumentTitles = relevantDocs.map(([doc]) => {return `"${doc.metadata?.title}"`});
    log.info(`🔍 Semantic relevance check passed for these documents: ${passedDocumentTitles.join(', ')}`);
    return relevantDocs;
}

/**
 * Semantic relevance check of the query against the document performed by LLM.
 * 
 * @private
 */
const _checkDocumentRelevance = async (document: any, query: string, config: any): Promise<string> => {
    const docTitle = document.metadata?.title || DOC_TITLE;
    const docContext = document.metadata?.context || '';
    
    // Load the semantic relevance template
    const template = loadConfigFile('semantic_relevance', 'md', 'ai/prompts/inner_api');
    
    // Preparing document structure that will be injected into the prompt
    const documentData = `
        Title: "${docTitle}"

        Content: 
        "${document.pageContent}"

        Tags: 
        "${document.metadata?.tags || ''}"
    `;
    
    // Format the prompt using the template
    const formattedPrompt = await template.format({
        query: query,
        document: documentData
    });
    
    // ===============================================
    // DEBUGGING OF SEMANTIC RELEVANCE PROMPT: Uncomment when you have to check how the prompt for semantic relevance is rendered
    // log.debug(formattedPrompt);
    // ===============================================

    const messages = [
        new SystemMessage(formattedPrompt)
    ];
    
    const response = await call(
        messages,
        {
            modelName: config.modelName,
            provider: 'openai',
            providerApiKey: config.providerApiKey,
            temperature: config.temperature || 0,
        },
        null
    );

    const result = response.content.toString().trim();

    // Validate response is exactly '0' or '1'
    if (result !== '0' && result !== '1') {
        log.warn(`Invalid relevance check response for document "${docTitle}": ${result}, defaulting to 0`);
        return '0';
    }

    return result;
}

// ============= Utility Functions =============

/**
 * Get current date and time in formatted string
 */
export const currentDate = () => {
    const date = new Date();
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${weekday}, ${month}/${day}/${year} ${hours}:${minutes}`;
}
