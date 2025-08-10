# HPMN Setup Guide

This guide will help you set up your own instance of HPMN (Hyper Personalised Model New).

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** or **Bun runtime** installed
- **TypeScript 5.0+** installed globally
- Access to the following services:
  - An LLM API (OpenAI, Anthropic, or compatible)
  - A vector database (Qdrant, Pinecone, or similar)
  - A relational database (PostgreSQL, MySQL, or compatible)
  - An embedding service (OpenAI, HuggingFace, or self-hosted)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hpmn-public
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

### 3. Configure Environment

Copy the example configuration:
```bash
cp examples/config/config.example.json config.json
```

Edit `config.json` with your service credentials:

```json
{
  "services": {
    "openai": {
      "apiKey": "sk-...",  // Your OpenAI API key
      "model": "gpt-4o-mini"
    },
    "database": {
      "relational": {
        "url": "postgresql://user:pass@host:5432/dbname",
        "apiKey": "your-db-api-key"
      },
      "vector": {
        "url": "https://your-qdrant-instance.com",
        "apiKey": "your-vector-db-key"
      }
    },
    // ... additional configuration
  }
}
```

### 4. Set Up Databases

#### Vector Database Setup

1. Create a collection for document embeddings:
   - Collection name: `hpmn_documents`
   - Vector size: 768 (for all-mpnet-base-v2)
   - Distance metric: Cosine

2. Create a collection for conversation memories:
   - Collection name: `hpmn_memories`
   - Vector size: 768
   - Distance metric: Cosine


### 5. Environment Variables

Set the following environment variables:

```bash
export NODE_ENV=development
export PORT=3000
export LOG_LEVEL=info
```

For production:
```bash
export NODE_ENV=production
export PORT=8080
export LOG_LEVEL=warn
```

## Running HPMN

### Development Mode

```bash
bun run dev
# or
npm run dev
```

This starts the server with hot reloading enabled.

### Production Mode

```bash
bun run build
bun run start
# or
npm run build
npm run start
```

## Support

For implementation questions or issues, please check the documentation first. For additional guidance on the full implementation, you can reach out via DM as mentioned in the README.
