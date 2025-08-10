import fs from 'fs';
import path from 'path';
import { PromptTemplate } from "@langchain/core/prompts";
import { getLogger } from './logger';

const log = getLogger('UTILS.HELPERS');

/**
 * Timer utility for measuring execution time
 */
export function timer() {
    const start = performance.now();
    return {
        stop: () => {
            const end = performance.now();
            return Math.round(end - start);
        }
    };
}

/**
 * Check if a request should be rate limited
 * 
 * @param currentTimestamp - Current timestamp in seconds
 * @param lastAcceptedTimestamp - Last accepted request timestamp in seconds
 * @param limit - Rate limit window in seconds
 * @returns true if request should be accepted, false if rate limited
 */
export function timestampRequestRejectAccept(
    currentTimestamp: number, 
    lastAcceptedTimestamp: number, 
    limit: number
): boolean {
    return currentTimestamp - lastAcceptedTimestamp >= limit;
}

/**
 * Load a configuration file (prompt template)
 * 
 * @param fileName - Name of the file without extension
 * @param extension - File extension (default: 'md')
 * @param subPath - Subdirectory path within src/ (default: 'ai/prompts')
 * @returns PromptTemplate instance
 */
export function loadConfigFile(
    fileName: string, 
    extension: string = 'md', 
    subPath: string = 'ai/prompts'
): PromptTemplate {
    try {
        // Construct the file path
        const filePath = path.join(__dirname, '..', subPath, `${fileName}.${extension}`);
        
        log.debug(`Loading config file from: ${filePath}`);
        
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract variables from the template
        const variables = extractTemplateVariables(content);
        
        // Create and return PromptTemplate
        return new PromptTemplate({
            template: content,
            inputVariables: variables
        });
    } catch (error) {
        log.error(`Failed to load config file ${fileName}.${extension}:`, error);
        throw new Error(`Could not load template file: ${fileName}.${extension}`);
    }
}

/**
 * Extract variable names from a template string
 * Looks for {{VARIABLE_NAME}} patterns
 * 
 * @param template - Template string
 * @returns Array of unique variable names
 */
function extractTemplateVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    
    let match;
    while ((match = regex.exec(template)) !== null) {
        variables.add(match[1].toLowerCase()); // Convert to lowercase for consistency
    }
    
    return Array.from(variables);
}

/**
 * Format a date to a readable string
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date = new Date()): string {
    return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Sleep for a specified number of milliseconds
 * Useful for retry logic or rate limiting
 * 
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                log.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, error);
                await sleep(delay);
            }
        }
    }
    
    throw lastError!;
}
