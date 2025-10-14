import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';
import { createLoggerConfig } from './config/logger.config';
import { createSwaggerConfig, SWAGGER_SETUP_OPTIONS } from './config/swagger.config';
import { createCorsConfig } from './config/cors.config';

const API_PREFIX = 'api/v1' as const;
const DOCS_PATH = 'api/docs' as const;

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);

  const app = await NestFactory.create(AppModule, {
    logger: createLoggerConfig(env),
  });

  setupMiddleware(app);
  setupSwagger(app);

  await app.listen(env.PORT);
}

function setupMiddleware(app: INestApplication): void {
  app.enableCors(createCorsConfig());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ZodValidationPipe());
}

function setupSwagger(app: INestApplication): void {
  patchNestJsSwagger();

  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(DOCS_PATH, app, document, SWAGGER_SETUP_OPTIONS);
}

bootstrap();
