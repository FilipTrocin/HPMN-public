# HPMN public

> **Note**: This is a distilled version of a full HPMN (Hyper Personalised Model New), containing core logic patterns without implementation details. A private version with full implementation exists for my personal use and cannot be published; however, for guidance on implementation, or a demo, please DM me.

> **Version status**: This public, distilled repository is a snapshot aligned with the private HPMN v2.2.0 and reflects the state of the system in mid‑2024. It is not actively updated.

## Overview

HPMN public is the open-source foundation of a personal AI assistant framework designed to provide highly customisable and controlled interactions with personal information.

## Key Features

- **Dual-Database Architecture**: Combines relational database for structured data with vector database for semantic search
- **Intent Recognition System**: Sophisticated pipeline for understanding user intent and routing to appropriate actions
- **Memory Management**: Long-term memory patterns for maintaining conversation context and user preferences
- **Action Selection**: Semantic matching system for executing user-requested actions
- **Prompt Engineering**: Carefully crafted prompts for consistent AI behaviour

## Architecture

```
📁 hpmn-public/
├─ src/
│  ├─ ai/              # Core AI logic and LLM interactions
│  ├─ logic/           # Thinking pipeline and decision-making
│  ├─ skills/          # Action execution and validation
│  ├─ database/        # Database abstraction layers
│  ├─ types/           # TypeScript type definitions
│  └─ utils/           # Helper functions
├─ examples/           # Implementation examples
├─ docs/              # Documentation
└─ tests/             # Test suite
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- TypeScript 5.0+
- Access to:
  - LLM API (OpenAI compatible)
  - Vector database (Qdrant or similar)
  - Relational database (PostgreSQL compatible)
  - Embedding service

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hpmn-public

# Install dependencies
bun install  # or npm install

# Copy configuration template
cp examples/config/config.example.json config.json

# Configure your services
# Edit config.json with your API keys and service URLs
```

### Configuration

See `examples/config/config.example.json` for the configuration template. You'll need to provide:
- LLM API credentials
- Database connection strings
- Embedding service endpoint
- Authentication tokens

### Running

```bash
# Development mode
bun run dev

# Production mode
bun run start
```

## Contributing

This is a personal project shared for concept demo. While not actively seeking contributions, feel free to use this pattern in your own projects.

## Licence

MIT Licence - See [LICENSE](LICENSE) file for details

## Contact

For implementation guidance or questions about the full version, please reach out via DM.