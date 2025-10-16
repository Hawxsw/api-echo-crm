import { createZodDto } from 'nestjs-zod';
import {
  CreateConversationSchema,
  SendWhatsAppMessageSchema,
  UpdateConversationSchema,
} from './whatsapp.schema';

export class CreateConversationDto extends createZodDto(CreateConversationSchema) {}

export class SendWhatsAppMessageDto extends createZodDto(SendWhatsAppMessageSchema) {}

export class UpdateConversationDto extends createZodDto(UpdateConversationSchema) {}

