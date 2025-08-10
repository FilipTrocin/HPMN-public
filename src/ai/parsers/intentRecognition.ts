import { JsonOutputParser } from '@langchain/core/output_parsers';

/**
 * Interface for intent recognition results
 * Defines the structure of the output from intent recognition
 */
export interface IntentRecognitionResult {
  type: 0 | 1;            // 0 = query, 1 = action
  category: 1 | 2 | 3 | 4;// 1=memory 2=note 3=resource 4=all
  summary: string;
}

/**
 * JsonOutputParser for intent recognition
 * Replaces YAML-based function calling with structured JSON parsing
 */
export const intentRecognitionParser = new JsonOutputParser<IntentRecognitionResult>();
