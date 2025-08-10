import { ChatOpenAI } from "@langchain/openai";
import { BaseMessageChunk } from "@langchain/core/messages";
import { OpenAIEmbeddings } from "@langchain/openai";
import { JsonOutputParser } from '@langchain/core/output_parsers';

import { saveMessage } from "../database/conversation";
import { timer } from "../utils/helpers";
import { getLogger } from "../utils/logger";
import { loadConfigFile } from "../utils/helpers";
import { getConfig } from "../utils/config";

const log = getLogger('AI.LLM');

/**
 * Factory function to create model instances
 * @param {ModelConfig} config - The configuration for the model
 * @returns The model instance
 */
function createModel(config: any) {
    /**
     * Configuration object for model instantiation.
     * @typedef {Object} ModelConfig
     * @property {string} provider - The provider of the model (e.g., 'openai', 'anthropic', 'gemini').
     * @property {string} [model] - The specific model to use (default is 'gpt-4o-mini').
     * @property {boolean} [streaming] - Whether to enable streaming (default is false).
     * @property {number} [temperature] - The sampling temperature (default is 0.5).
     * @property {number} [maxTokens] - The maximum number of tokens to generate.
     * @property {number} [topP] - The top-p sampling parameter.
     * @property {number} [timeout] - The timeout for the model call.
     * @property {number} [maxRetries] - The maximum number of retries for the model call.
     */
    switch (config.provider) {
        case 'openai':
            log.info('Selected OpenAI model');
            return new ChatOpenAI({
                model: config.model ?? 'gpt-4o-mini', // Default model
                apiKey: config.providerApiKey,
                streaming: config.streaming ?? false,
                temperature: config.temperature ?? 0.5,
                maxTokens: config.maxTokens,
                topP: config.topP,
                timeout: config.timeout,
                maxRetries: config.maxRetries
            });
        // TODO: Add cases for other providers here
        default:
            log.error('Selected model is not supported');
            throw new Error(`Unsupported provider: ${config.provider}`);
    }
}

/**
 * Call the LLM with the given messages, configuration, and interaction.
 * This is a low-level method that directly interfaces with the LLM.
 * 
 * Use this method when you:
 *    - Want to specify parameters like model type, temperature, or streaming options directly for the LLM call.
 *    - Want to implement structured output parsing with OutputParser
 *    - Need to handle streaming responses (support is directly in the method)
 *    - Want to save messages to the conversation history
 * 
 * @param messages - The messages to send to the LLM. Any of HumanMessage, AIMessage, or SystemMessage.
 * @param config - Configuration object for the LLM:
 *    - provider: string - The model provider (e.g. 'openai')
 *    - modelName?: string - Model name (e.g. 'gpt-4o-mini')
 *    - providerApiKey: string - API key for the provider
 *    - streaming?: boolean - Whether to enable streaming mode
 *    - temperature?: number - Sampling temperature (0-1)
 *    - maxTokens?: number - Maximum tokens to generate
 *    - topP?: number - Top-p sampling parameter
 *    - timeout?: number - Request timeout in ms
 *    - maxRetries?: number - Maximum number of retries
 * @param interaction - Optional context required only for streaming and conversation tracking. Specifically:
 *    1. Using streaming responses (config.streaming = true):
 *       - response: Express.js Response object to write streaming tokens
 *       - start: Performance timestamp to measure response time
 *    2. Saving chat history (in standard chat mode):
 *       - conversationId: Required to save messages to conversation history
 * @param outputParser - OutputParser configuration (optional):
 *    - parser: JsonOutputParser instance for structured JSON parsing
 *    - promptTemplate: string - Template file name for the prompt
 *    - promptVars: Record<string, string> - Variables to inject into the prompt
 * @returns The response from the LLM:
 *    - For OutputParser: Parsed structured object
 *    - For chat: { content: string }
 */
export const call = async (
    messages: any[], 
    config: any, 
    interaction: any, 
    outputParser?: {
        parser: JsonOutputParser<any>,
        promptTemplate: string,
        promptVars: Record<string, string>
    }
): Promise<any> => {
    // Get API key from config if not provided
    if (!config.providerApiKey) {
        const appConfig = getConfig();
        config.providerApiKey = appConfig.services.openai.apiKey;
    }

    const model = createModel(config);

    // OutputParser mode (structured parsing approach)
    if (outputParser) {
        try {
            log.info('Selected "OutputParser" mode for structured JSON parsing');
            
            // Load prompt template
            const template = loadConfigFile(outputParser.promptTemplate, 'md', 'ai/prompts');
            
            // Inject format instructions from parser
            const formatInstructions = outputParser.parser.getFormatInstructions();
            const promptWithInstructions = await template.format({
                ...outputParser.promptVars,
                FORMAT_INSTRUCTIONS: formatInstructions
            });

            // Create a simple prompt and invoke directly with the model
            const result = await model.invoke([
                { role: 'user', content: promptWithInstructions }
            ]);
            
            // Parse the result using the parser - ensure content is string
            const contentString = typeof result.content === 'string' ? result.content : String(result.content);
            const parsedResult = await outputParser.parser.parse(contentString);
            return parsedResult;
            
        } catch (error) {
            log.error(`OutputParser chain failed: ${error}`);
            throw new Error(`Failed to parse LLM output: ${error}`);
        }
    }

    // Standard "chat mode" with existing streaming setup
    const configuration = config.streaming ? {
        callbacks: [{
            handleLLMNewToken(token: string) {
                interaction?.response?.write(token);
            },
            handleLLMEnd: async (output: any, runId: string) => {
                await saveMessage(interaction?.conversationId, 
                    messages[messages.length - 1].content, 
                    output.generations[0][0].text
                );
            },
        }]
    } : undefined;

    log.info(`Selected "Standard Chat" mode` + (config.streaming ? ' with streaming' : ''));
    log.debug(`Waiting for the model ${config.modelName} to return the full message...`);
    const { content } = await model.invoke(messages, configuration);
    return { content };
}
