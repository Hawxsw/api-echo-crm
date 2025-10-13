import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { EnvConfig } from './env.validation';

export const createLoggerConfig = (env: EnvConfig) => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isProduction = env.NODE_ENV === 'production';

  const format = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint(),
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
      const contextStr = context ? `[${context}]` : '';
      const stackStr = stack ? `\n${stack}` : '';
      return `${timestamp} ${level} ${contextStr} ${message}${stackStr}`;
    }),
  );

  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      level: isDevelopment ? 'debug' : 'info',
      format: isDevelopment ? consoleFormat : format,
    }),
  );

  // File transports for production
  if (isProduction) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );
  }

  return WinstonModule.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format,
    transports,
    exitOnError: false,
  });
};
