import { JsonOutputParser } from '@langchain/core/output_parsers';

/**
 * Interface for action selection results
 * Defines the structure of the output from action selection
 */
export interface ActionSelectionResult {
  action_name: string;
  confidence: number;      // 0 … 1
  reasoning: string;
  extracted_parameters: Record<string, unknown>;
}

/**
 * JsonOutputParser for action selection
 * Replaces YAML-based function calling with structured JSON parsing
 */
export const actionSelectionParser = new JsonOutputParser<ActionSelectionResult>();
