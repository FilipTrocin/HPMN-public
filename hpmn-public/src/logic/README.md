# Logic Module

This module contains the thinking pipeline and decision-making logic for HPMN.

## Key Components

### thinking.ts
The core thinking pipeline that handles:
- **Intent Recognition**: Determines if user input is a query or action
- **Response Generation**: Creates contextual responses using conversation history
- **Document Reranking**: Semantically evaluates document relevance

### Categories:
1. **Memory**: Explicit memorisation requests
2. **Note**: Reading existing notes/documents
3. **Resource**: Managing inventories, prices, items
4. **All**: General conversation

## Response Generation

The system generates responses by:
1. Building context from conversation history
2. Including relevant memories or action results
3. Applying personality through system prompts
4. Formatting with current date/time

## Document Reranking

When retrieving information from vector search:
1. Initial vector similarity search
2. LLM-based semantic relevance check
3. Filter to only truly relevant documents

## Usage Example

```typescript
import { intentRecognition, respond } from './thinking';

// Recognise intent
const intent = await intentRecognition(userQuery, conversationHistory);

// Generate response
const response = await respond(
  userQuery,
  conversationHistory,
  context
);
```