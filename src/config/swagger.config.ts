import { DocumentBuilder } from '@nestjs/swagger';

export const createSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Echo CRM API')
    .setDescription(
      `API completa para sistema CRM com funcionalidades de:
      - Autenticação e autorização (JWT + RBAC)
      - Gestão de empresas e departamentos
      - Gestão de usuários e colaboradores
      - Chat em tempo real com WebSocket
      - WhatsApp mockado com respostas automáticas
      - Kanban customizável para gestão de tarefas
      
      ## Tecnologias
      - NestJS
      - Prisma ORM
      - PostgreSQL
      - Zod para validação
      - Socket.io para WebSocket
      - JWT para autenticação
      `
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e registro de usuários')
    .addTag('users', 'Gestão de usuários')
    .addTag('company', 'Gestão de empresas e departamentos')
    .addTag('chat', 'Chat em tempo real entre funcionários')
    .addTag('whatsapp', 'WhatsApp mockado para comunicação com clientes')
    .addTag('kanban', 'Kanban customizável para gestão de tarefas')
    .build();
};

export const SWAGGER_SETUP_OPTIONS = {
  customSiteTitle: 'Echo CRM API Documentation',
  customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #e0234e }
  `,
};

