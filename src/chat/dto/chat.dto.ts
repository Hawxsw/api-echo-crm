import { createZodDto } from 'nestjs-zod';
import {
  CreateChatSchema,
  SendMessageSchema,
  UpdateMessageSchema,
  MarkAsReadSchema,
} from './chat.schema';

/**
 * DTO para criar chat
 */
export class CreateChatDto extends createZodDto(CreateChatSchema) {}

/**
 * DTO para enviar mensagem
 */
export class SendMessageDto extends createZodDto(SendMessageSchema) {}

/**
 * DTO para atualizar mensagem
 */
export class UpdateMessageDto extends createZodDto(UpdateMessageSchema) {}

/**
 * DTO para marcar mensagens como lidas
 */
export class MarkAsReadDto extends createZodDto(MarkAsReadSchema) {}

