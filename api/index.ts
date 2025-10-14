import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from '../src/app.module';
import { validateEnv } from '../src/config/env.validation';
import { createLoggerConfig } from '../src/config/logger.config';
import { createSwaggerConfig, SWAGGER_SETUP_OPTIONS } from '../src/config/swagger.config';
import { createCorsConfig } from '../src/config/cors.config';

const API_PREFIX = 'api/v1' as const;
const DOCS_PATH = 'api/docs' as const;

let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const env = validateEnv(process.env);

  const app = await NestFactory.create(AppModule, {
    logger: createLoggerConfig(env),
  });

  app.enableCors(createCorsConfig());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ZodValidationPipe());

  // Setup Swagger
  patchNestJsSwagger();
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCS_PATH, app, document, SWAGGER_SETUP_OPTIONS);

  await app.init();

  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}

