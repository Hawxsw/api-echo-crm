import { createZodDto } from 'nestjs-zod';
import {
  CreateConversationSchema,
  SendWhatsAppMessageSchema,
  UpdateConversationSchema,
} from './whatsapp.schema';

/**
 * DTO para criar conversa do WhatsApp
 */
export class CreateConversationDto extends createZodDto(CreateConversationSchema) {}

/**
 * DTO para enviar mensagem no WhatsApp
 */
export class SendWhatsAppMessageDto extends createZodDto(SendWhatsAppMessageSchema) {}

/**
 * DTO para atualizar conversa do WhatsApp
 */
export class UpdateConversationDto extends createZodDto(UpdateConversationSchema) {}

