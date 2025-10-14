const { NestFactory } = require('@nestjs/core');
const { SwaggerModule } = require('@nestjs/swagger');
const { patchNestJsSwagger, ZodValidationPipe } = require('nestjs-zod');
const { AppModule } = require('../dist/src/app.module');
const { validateEnv } = require('../dist/src/config/env.validation');
const { createLoggerConfig } = require('../dist/src/config/logger.config');
const { createSwaggerConfig, SWAGGER_SETUP_OPTIONS } = require('../dist/src/config/swagger.config');
const { createCorsConfig } = require('../dist/src/config/cors.config');

const API_PREFIX = 'api/v1';
const DOCS_PATH = 'api/docs';

let cachedApp;

async function createApp() {
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

module.exports = async (req, res) => {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
};

module.exports.default = module.exports;

