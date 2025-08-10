import fs from 'fs';

import { getLogger } from '../../utils/logger';

const log = getLogger('AI.PROMPTS.LOADER');

/**
 * Reads a Markdown file from the specified path and returns its contents as a string.
 * All original formatting, including whitespaces and line breaks, is preserved.
 * 
 * @param filePath - The path to the Markdown file to be read. 
 * The path NEEDS TO BE relative to the root of the project from where the method is being called.
 * @returns The contents of the Markdown file as a string
 * @throws {Error} If the file cannot be read or does not exist
 */
export function loadPrompt(filePath: string): string {
    log.debug(`Loading prompt from ${filePath}...`);
    const prompt = fs.readFileSync(filePath, 'utf8');
    log.debug(`Prompt loaded successfully!`);
    return prompt;
}
