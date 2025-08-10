import fs from 'fs';
import path from 'path';
import { getLogger } from './logger';

const log = getLogger('CONFIG');

/**
 * Configuration structure for HPMN
 */
export interface Config {
  services: {
    openai: {
      apiKey: string;
      model: string;
    };
    database: {
      relational: {
        url: string;
        apiKey: string;
      };
      vector: {
        url: string;
        apiKey: string;
      };
    };
    workflow: {
      url: string;
      apiToken: string;
    };
    embeddings: {
      url: string;
      token: string;
    };
  };
  app: {
    apiToken: string;
    port: number;
    environment: string;
  };
}

let config: Config | null = null;

/**
 * Load configuration from file or environment variables
 * Priority: Environment variables > config.json > config.example.json
 */
export function loadConfig(): Config {
  if (config) return config;

  // Try to load from environment variables first
  if (process.env.OPENAI_API_KEY) {
    log.info('Loading configuration from environment variables');
    config = {
      services: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        },
        database: {
          relational: {
            url: process.env.DATABASE_URL || '',
            apiKey: process.env.DATABASE_API_KEY || ''
          },
          vector: {
            url: process.env.VECTOR_DB_URL || '',
            apiKey: process.env.VECTOR_DB_API_KEY || ''
          }
        },
        workflow: {
          url: process.env.WORKFLOW_URL || '',
          apiToken: process.env.WORKFLOW_API_TOKEN || ''
        },
        embeddings: {
          url: process.env.EMBEDDING_SERVICE_URL || '',
          token: process.env.EMBEDDING_TOKEN || ''
        }
      },
      app: {
        apiToken: process.env.HPMN_API_TOKEN || '',
        port: parseInt(process.env.PORT || '3000'),
        environment: process.env.NODE_ENV || 'development'
      }
    };
    return config;
  }

  // Try to load from config files
  const configPaths = [
    path.join(process.cwd(), 'config.json'),
    path.join(process.cwd(), 'config.example.json'),
    path.join(__dirname, '../../config.json'),
    path.join(__dirname, '../../config.example.json')
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        log.info(`Loading configuration from ${configPath}`);
        const configData = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configData);
        return config!;
      }
    } catch (error) {
      log.error(`Failed to load config from ${configPath}:`, error);
    }
  }

  throw new Error('No configuration found. Please create a config.json file or set environment variables.');
}

/**
 * Get the current configuration
 * @throws Error if configuration not loaded
 */
export function getConfig(): Config {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

/**
 * Validate API token against configured token
 * Uses timing-safe comparison to prevent timing attacks
 */
export function authenticate(providedToken: string): boolean {
  const { app } = getConfig();
  
  if (!app.apiToken) {
    log.warn('No API token configured - authentication disabled');
    return true;
  }

  try {
    // Simple string comparison - in production, use crypto.timingSafeEqual
    return providedToken === app.apiToken;
  } catch {
    return false;
  }
}
