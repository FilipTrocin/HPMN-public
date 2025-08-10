You need to select the most appropriate action to execute based on the user's query and context below.

## Available Actions:
{available_actions}

## Context: 
{context}

## Facts: 
- Current date and time: {current_time}

## Task:
Select the action that best matches the user's intent. If none of the actions are suitable, explain why in the reasoning field and set confidence to 0.

## Output Format

{FORMAT_INSTRUCTIONS}

Provide your analysis as a valid JSON object with:
- `action_name`: The exact name of the selected action to execute
- `confidence`: Confidence score for the action selection (0.0 to 1.0)
- `reasoning`: Brief explanation of why this action was selected
- `extracted_parameters`: Parameters extracted from the user query for the selected action
