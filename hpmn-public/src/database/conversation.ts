import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

import { getDatabaseClient, Message } from "./interfaces";
import { call } from "../ai/llm";
import { loadPrompt } from "../ai/prompts/loader";
import { getLogger } from "../utils/logger";
import { getConfig } from "../utils/config";
import path from 'path';

const log = getLogger('DATABASE.CONVERSATION');

const database_choose_conversation_title_prompt = loadPrompt(path.join(__dirname, '../ai/prompts/inner_api/database_choose_conversation_title.md'));

/**
 * Retrieves messages from a specific conversation and converts them into a format suitable for AI context.
 * 
 * This method fetches messages from the database for a given conversation ID and transforms them 
 * into an array of alternating HumanMessage and AIMessage objects. These messages can then be used 
 * to provide context for the AI in subsequent interactions.
 * 
 * @param conversationId - The unique identifier of the conversation to retrieve
 * @param limit - Maximum number of most recent messages to retrieve (default: 10)
 * @returns Array of alternating HumanMessage and AIMessage objects, or empty array if no messages found
 * 
 * @example
 * ```ts
 * // Get last 5 messages from conversation
 * const messages = await currentConversation('A567FSDHJ809', 5);
 * 
 * // Use messages as context for AI
 * const response = await call(messages.concat([new HumanMessage(newQuestion)]));
 * ```
 */
export const currentConversation = async (conversationId: string, limit: number = 10) => {
    
    const messages = await conversationsAvailable(conversationId, false, limit);
    if (!messages || !Array.isArray(messages)) {
        log.info('No conversation history for conversationId: ' + conversationId + '. Moving on...');
        return [];
    }

    try {
        // Take only the most recent messages up to the limit
        const recentMessages = messages.slice(-limit);

        return recentMessages.map((message: Message) => {
            if (!message.question || !message.answer) {
                log.warn(`Incomplete message found in conversation ${conversationId}`);
                return [];
            }
            return [
                new HumanMessage(message.question),
                new AIMessage(message.answer)
            ];
        }).flat();
    } catch (e) {
        log.error('Error while retrieving conversation history:', e);
        return [];
    }   
}

/**
 * Retrieve messages for a given conversationID 
 * 
 * @param conversationId - The ID of the conversation to retrieve messages from
 * @param getFirst - If true, returns only the first message. If false, returns multiple messages
 * @param limit - Maximum number of most recent messages to retrieve (default: 10, ignored if `getFirst` is true)
 * @returns The conversation messages if they exist, null otherwise
 * 
 * @example
 * ```ts
 * // Get first message only
 * const firstMsg = await conversationsAvailable('A567FSDHJ809', true);
 * 
 * // Get 20 most recent messages
 * const recentMsgs = await conversationsAvailable('A567FSDHJ809', false, 20);
 * ```
 */
const conversationsAvailable = async (conversationId: string, getFirst: boolean = true, limit: number = 10) => {
    const client = getDatabaseClient();

    try {
        if (getFirst) {
            log.debug(`Attempting to retrieve the first message for conversation: ${conversationId}`);
            const message = await client.getFirstMessage(conversationId);
                
            if (message) {
                log.info(`Found first message for conversation: ${conversationId}`);
                return message;
            }
        } else {
            log.debug(`Attempting to retrieve last ${limit} messages for conversation: ${conversationId}`);
            const messages = await client.getMessages(conversationId, limit);
                
            if (messages && messages.length > 0) {
                log.info(`Found ${messages.length} messages for conversation: ${conversationId}`);
                return messages;
            }
        }

        log.info(`No conversation ${conversationId} found in the database`);
        return null;
    } catch (error) {
        log.error(`Error retrieving messages for conversation ${conversationId}:`, error);
        return null;
    }
}

/**
 * Removes conversations that have been inactive for a specified number of days
 * 
 * @param days - The number of days after which a conversation is considered inactive
 */
export const dumpInactiveConversations = async (days: number = 15) => {
    const client = getDatabaseClient();
    log.debug(`Looking for conversations inactive for more than ${days} days...`);

    try {
        await client.deleteInactiveConversations(days);
        log.info('Successfully processed inactive conversations');
    } catch (error) {
        log.error('Error while dumping inactive conversations:', error);
    }
}

/**
 * Saves a message exchange between user and AI to the database.
 * If this is the first message in a conversation, it generates a title using the AI model.
 * Otherwise, it uses the existing conversation title.
 * 
 * @param conversationId - Unique identifier for the conversation
 * @param message - The user's message/question
 * @param response - The AI's response
 * 
 * @example
 * ```ts
 * await saveMessage('A567FSDHJ809', 'What is TypeScript?', 'TypeScript is a programming language...');
 * ```
 */
export const saveMessage = async (conversationId: string, message: string, response: string) => {
    try {
        const client = getDatabaseClient();
        const config = getConfig();

        // Check if conversation already exists - get first message to get title
        const firstMessage = await conversationsAvailable(conversationId, true) as Message | null;
        let title = '';
        
        // If no existing messages, use LLM to determine the title
        if (!firstMessage) {
            log.info("Generating title for the conversation...");
            const messages = [
                new SystemMessage(database_choose_conversation_title_prompt),
                new HumanMessage(message),
                new AIMessage(response),
            ];
            
            const result = await call(
                messages,
                { 
                    modelName: config.services.openai.model, 
                    provider: 'openai', 
                    providerApiKey: config.services.openai.apiKey,
                },
                { conversationId }
            );
            title = result.content;
            log.debug(`Title generated: ${title}`);
        } else {
            // Use existing conversation title
            title = firstMessage.name;
        }

        log.info(`Saving question-answer message under conversation ${conversationId}...`);
        await client.createMessage({
            conversation_id: conversationId,
            question: message,
            answer: response,
            name: title
        });
        log.info('Message saved successfully!');
    } catch (e) {
        log.error('There was an error while saving the message:', e);
    }
}
