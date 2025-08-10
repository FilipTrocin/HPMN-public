# Deployment Workflows (n8n)

This repository does not include any workflow JSON exports. If you use a workflow automation tool (e.g., n8n), you should keep your exported workflows locally and place them in the following directory during deployment:

```
deployment/
  scenarios/
    n8n/
      <your-workflow-1>.json
      <your-workflow-2>.json
```

## How to use

1. Build your workflows in your n8n instance.
2. Export each workflow as JSON from n8n (Settings → Workflows → Export).
3. Save the JSON files into `deployment/scenarios/n8n/`.
4. Your application should reference these workflows via your configured workflow URL (see `hpmn-public/src/integrations/workflow.ts`).
