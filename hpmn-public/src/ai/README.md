# AI Module

This module contains the core AI functionality for HPMN, including LLM integration, prompt management, and response parsing.

## Structure

- **`llm.ts`** - Main LLM interface supporting multiple providers
- **`parsers/`** - Structured output parsers for AI responses
  - `intentRecognition.ts` - Parses user intent (query vs action)
  - `actionSelection.ts` - Selects appropriate actions based on context
- **`prompts/`** - Prompt templates for various AI operations
  - `inner_api/` - Core system prompts
  - `loader.ts` - Utility for loading prompt templates

## Key Concepts

### Intent Recognition
The system classifies user input into:
- **Type**: Query (0) or Action (1)
- **Category**: Memory (1), Note (2), Resource (3), or General (4)

### Action Selection
When an action is needed, the system:
1. Analyses available actions
2. Matches user intent to action capabilities
3. Extracts parameters from the query
4. Returns confidence score and reasoning

### Prompt Management
Prompts are stored as Markdown templates with variable substitution:
```markdown
## User query
<query>
{query}
</query>
```

## Usage Example

```typescript
import { call } from './llm';
import { intentRecognitionParser } from './parsers/intentRecognition';

const result = await call(
  messages,
  { provider: 'openai', model: 'gpt-4o-mini' },
  interaction,
  {
    parser: intentRecognitionParser,
    promptTemplate: 'intent_recognition.md',
    promptVars: { query: userInput }
  }
);
```