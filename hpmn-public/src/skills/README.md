# Skills Module

This module manages the action execution system for HPMN, allowing the assistant to perform tasks beyond simple conversation.

## Components

### action.ts
Core action execution logic:
- **Action Discovery**: Finds relevant actions via vector search
- **Action Selection**: Uses LLM to choose the best action
- **Action Execution**: Calls external workflows/webhooks
- **Result Handling**: Processes and returns action results

### schemas.ts
Predefined action schemas including:
- **memorise**: Store information in long-term memory
- **manage_inventory_medical**: Track medical supplies and supplements
- **manage_inventory_shopping**: Manage groceries and household items


## Adding New Actions

### 1. Define Schema
```javascript
export const newActionSchema = {
    "name": "action_name",
    "description": "What this action does",
    "parameters": {
        "type": "object",
        "properties": {
            // Define required parameters
        },
        "required": ["param1", "param2"]
    }
}
```

### 2. Register Action
```javascript
await addAction({
    name: "action_name",
    description: "Detailed description",
    schema: newActionSchema,
    webhook: "https://your-endpoint.com/webhook",
    tags: ["tag1", "tag2"]
});
```

### 3. Implement Webhook
Your webhook should:
- Accept GET/POST requests with query parameters
- Process the action
- Return JSON response


## Default Actions

The system comes with example actions for:
- Memory management
- Inventory tracking
- Shopping list management
