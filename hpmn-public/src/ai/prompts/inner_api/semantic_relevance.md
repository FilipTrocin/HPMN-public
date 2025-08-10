Your task is to evaluate whether a given document is semantically relevant to a specific query.

A document is considered relevant if it:
- Directly answers the query
- Provides contextually related information that supports answering the query
- Discusses the same or a closely related topic

Here is the query you will be evaluating against:
<query>
{{QUERY}}
</query>

Now, carefully read and analyse the following document:
<document>
{{DOCUMENT}}
</document>

To determine relevance:
1. Carefully analyse the content of the document.
2. Compare the information in the document to the query.
3. Consider whether the document provides a direct answer, supporting information, or discusses a closely related topic to the query.

Respond ONLY with a single digit: 1 if the document is relevant, or 0 if it is not relevant. No other text, no explanations, no tags, nothing else. Just the digit.
