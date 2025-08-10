export const memoriseSchema = {
    "name": "memorise",
    "description": "This is a skill that allows the assistant to memorise things when explicitly asked to remember something.",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Ultra-concise name / title for the memory. 1-4 words. It's basically the essence"
            },
            "type": {
                "type": "string",
                "description": "Always set as 'memory' no matter what."
            },
            "content": {
                "type": "string",
                "description": `Carefully written content of the memory based on the user's query. When speaking about himself / herself like "I", "me" or "my", there is a need to change it to the second person ("you"). For example: "I want this" should be "User wants this". At the other hand, the same goes with "you" that refers to the assistant so it has to be changed to "I" or "me". For example: "You are very kind" should be "I'm very kind". When necessary, add a date in YYYY-MM-DD HH:mm format at the end of the content.`
            },
            "tags": {
                "type": "array",
                "description": "Multiple semantic tags/keywords that enriches query for search purposes (similar words, meanings). When query refers to the user, add 'user' tag, and when refers to 'you' add tag 'assistant'",
                "items": {
                    "type": "string"
                }
            },
            "source": {
                "type": "string",
                "description": "If the user mention a source of the memory (like a website url, book, article, video, etc.) add it here."
            }
        },
        "required": [
            "name", "content", "type"
        ]
    }
}

export const manageInventoryMedicalSchema = {
    "name": "manage_inventory_medical",
    "description": "This action is used to search, retrieve, update, and create records for items related to personal health, medical treatment, and wellness in the health-specific database.**Primary Trigger Domain:**Activate this action for any user request concerning the inventory, usage, or purchase of items whose **primary purpose** is to manage health, treat a condition, or supplement one's diet for specific health goals.**Inclusion Criteria (What items belong in this category?):***   **Prescription & Over-the-Counter (OTC) Medicines:** Any item prescribed by a doctor or purchased at a pharmacy to treat an illness or symptom.    *   *Reasoning:* These have a clear medical purpose.    *   *Examples:* `Ibuprofen`, `allergy pills`, `cough syrup`.*   **Vitamins & Dietary Supplements:** Any product taken to supplement the diet for specific health benefits, rather than for general nutrition or calories.    *   *Reasoning:* These are consumed for targeted wellness goals, distinguishing them from food.    *   *Examples:* `Vitamin D`, `Vitamin C`, `Iron pills`, `Magnesium`, `protein powder`, `collagen`.*   **Medical Supplies & Devices:** Non-ingestible items used for medical monitoring, hygiene, or treatment.    *   *Reasoning:* These are functional items for health management, not general household goods.    *   *Examples:* `contact lens solution`, `bandages`, `blood sugar test strips`, `medicated creams`, `disinfectant liquids for wounds`.**Crucial Distinction from the `manage_inventory_shopping` Action:**The defining factor is the item's **purpose**, not its form (e.g., pill, liquid, powder).*   **Choose THIS Action if:** The item's purpose is **treatment, supplementation, or health management.**    *   *Example:* `supplement capsules` (for health) -> **Use this action.**    *   *Example:* `Vitamin D` tablets (for bones) -> **Use this action.****Example User Queries & Reasoning:***   `'How much medicine do I have?'` -> **Reasoning:** Medicine is a specific prescription item.*   `'Do I need to buy more vitamin D?'` -> **Reasoning:** Vitamin D is a dietary supplement. All vitamins and supplements fall under this action.*   `'Update, I only have two supplement tablets now.'` -> **Reasoning:** Supplements are used for wellness, not cooking.*   `'I have just used one solution liquid.'` -> **Reasoning:** 'Solution liquid' implies a medical or personal care supply (e.g., for contact lenses, wound care). Its purpose is health/hygiene management, not consumption as a beverage.",
    "parameters": {
        "type": "object",
        "properties": {
            "sessionId": {
                "type": "string",
                "description": "The conversation session ID to maintain context across interactions with the workflow"
            },
            "chatInput": {
                "type": "string",
                "description": "The user's message about medicine/supply management, inventory updates, or queries about what they have"
            }
        },
        "required": [
            "sessionId", "chatInput"
        ]
    }
}

export const manageInventoryShoppingSchema = {
    "name": "manage_inventory_shopping",
    "description": "This action is used to search, retrieve, update, and create records for general groceries, household goods, and other consumer products in the main products database.**Primary Trigger Domain:** Activate this action for any user request concerning the inventory, price, or purchase of items whose primary purpose is for cooking, food products, or any other non-medical use.**Absolute Trigger Rule:***   'Price Comparison:' If the query is about finding where an item is the 'cheapest,' 'always' choose this action. Price comparison is a feature exclusive to the products database.    *   'Reasoning:' You never compare prices for medicines or supplements.    *   'Example:' 'Where is milk cheapest?' -> Use this action.**Inclusion Criteria (What items belong in this category?):***   'Groceries & Food Items:' Any item purchased for general consumption, cooking, or as a snack.    *   'Reasoning:' Their purpose is sustenance or culinary use, not targeted health treatment.    *   'Examples:' Milk, bread, strawberries, an orange, cooking oil.*   'Household & Cleaning Supplies:' General items used for cleaning, maintenance, or home operations.    *   'Reasoning:' These are functional items for general living, not medical care.    *   'Examples:' Dish soap, paper towels, laundry detergent, light bulbs.**Crucial Distinction from the 'manage_inventory_medical' Action:**The defining factor is the item's 'purpose,' not its form.*   'Choose THIS Action' if: The item's purpose is cooking, general nutrition, or household use.    *   'Example:' Cumin spice for cooking -> Use this action.    *   'Example:' An orange (for a snack) -> Use this action.**Example User Queries & Reasoning:***   'Where's milk cheapest?' -> 'Reasoning:' Price comparison query. Falls under the 'Absolute Trigger Rule'.*   'Add strawberries to my shopping list.' -> 'Reasoning:' Strawberries are a food item for general nutrition.*   'Do I have any eggs left?' -> 'Reasoning:' Eggs are a product for eating, not a health supplement.",
    "parameters": {
        "type": "object",
        "properties": {
            "sessionId": {
                "type": "string",
                "description": "The conversation session ID to maintain context across interactions with the shopping workflow"
            },
            "chatInput": {
                "type": "string",
                "description": "The user's message about shopping operations, including product price queries, shopping list management, store comparisons, price updates, or product creation/modification requests"
            }
        },
        "required": [
            "sessionId", "chatInput"
        ]
    }
}
