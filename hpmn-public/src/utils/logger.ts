import winston from "winston";

/**
 * Get the appropriate log severity level based on environment
 */
const getLogsSeverityLevel = (): string => {
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

/**
 * Create a logger instance with the specified name
 * 
 * @param name - The name/category for this logger
 * @returns Winston logger instance
 */
export function getLogger(name: string): winston.Logger {
  const logLevel = getLogsSeverityLevel();

  // For production, you can add your own transport (e.g., CloudWatch, Datadog, etc.)
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, logger }) => {
          return `[${timestamp}] [${level.padEnd(8)}] [${logger}]: ${message}`;
        })
      )
    })
  ];

  // Add file transport for production
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.json()
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.json()
      })
    );
  }

  return winston.createLogger({
    level: logLevel,
    defaultMeta: { logger: name },
    transports
  });
}

export const log = getLogger('SYSTEM');
