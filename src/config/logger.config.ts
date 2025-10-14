import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { EnvConfig } from './env.validation';

const LOG_FILE_MAX_SIZE = 5_242_880;
const LOG_FILE_MAX_FILES = 5;

const createJsonFormat = (): winston.Logform.Format =>
  winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint(),
  );

const createConsoleFormat = (): winston.Logform.Format =>
  winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
      const contextStr = context ? `[${context}]` : '';
      const stackStr = stack ? `\n${stack}` : '';
      return `${timestamp} ${level} ${contextStr} ${message}${stackStr}`;
    }),
  );

const createConsoleTransport = (isDevelopment: boolean, format: winston.Logform.Format): winston.transport =>
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: isDevelopment ? createConsoleFormat() : format,
  });

const createFileTransports = (format: winston.Logform.Format): winston.transport[] => [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format,
    maxsize: LOG_FILE_MAX_SIZE,
    maxFiles: LOG_FILE_MAX_FILES,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format,
    maxsize: LOG_FILE_MAX_SIZE,
    maxFiles: LOG_FILE_MAX_FILES,
  }),
];

export const createLoggerConfig = (env: EnvConfig) => {
  const isDevelopment = env.NODE_ENV === 'development';
  const isProduction = env.NODE_ENV === 'production';
  const format = createJsonFormat();

  const transports: winston.transport[] = [createConsoleTransport(isDevelopment, format)];

  if (isProduction) {
    transports.push(...createFileTransports(format));
  }

  return WinstonModule.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format,
    transports,
    exitOnError: false,
  });
};
