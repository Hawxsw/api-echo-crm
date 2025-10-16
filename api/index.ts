import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../dist/src/app.module';
import { validateEnv } from '../dist/src/config/env.validation';
import { createLoggerConfig } from '../dist/src/config/logger.config';
import { createSwaggerConfig, SWAGGER_SETUP_OPTIONS } from '../dist/src/config/swagger.config';
import { createCorsConfig } from '../dist/src/config/cors.config';

const API_PREFIX = 'api/v1';
const DOCS_PATH = 'api/docs';

let cachedApp: INestApplication | null = null;

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

  patchNestJsSwagger();
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(DOCS_PATH, app, document, SWAGGER_SETUP_OPTIONS);

  await app.init();

  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
};

