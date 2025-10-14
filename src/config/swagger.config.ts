import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const createSwaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('Echo CRM API')
    .setDescription('Modern CRM API with NestJS, Prisma, PostgreSQL, and Zod')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User management')
    .addTag('roles', 'Role and permission management')
    .addTag('departments', 'Department hierarchy management')
    .addTag('chat', 'Real-time chat functionality')
    .addTag('whatsapp', 'WhatsApp conversation management')
    .addTag('kanban', 'Kanban board and task management')
    .addTag('sales', 'Sales pipeline and opportunity management')
    .addTag('notifications', 'User notifications')
    .build();

export const SWAGGER_SETUP_OPTIONS: SwaggerCustomOptions = {
  customSiteTitle: 'Echo CRM API Documentation',
  customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #e0234e }',
};

