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
  try {
    console.log('🚀 Starting application...');
    
    const env = validateEnv(process.env);
    console.log('✅ Environment validated');

    const app = await NestFactory.create(AppModule, {
      logger: createLoggerConfig(env),
    });
    console.log('✅ App created');

    setupMiddleware(app);
    console.log('✅ Middleware setup');
    
    setupSwagger(app);
    console.log('✅ Swagger setup');

    const port = env.PORT || process.env.PORT || 8000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on 0.0.0.0:${port}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
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
