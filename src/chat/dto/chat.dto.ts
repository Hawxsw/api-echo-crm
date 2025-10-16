import { createZodDto } from 'nestjs-zod';
import {
  CreateChatSchema,
  SendMessageSchema,
  UpdateMessageSchema,
  MarkAsReadSchema,
} from './chat.schema';

export class CreateChatDto extends createZodDto(CreateChatSchema) {}

export class SendMessageDto extends createZodDto(SendMessageSchema) {}

export class UpdateMessageDto extends createZodDto(UpdateMessageSchema) {}

export class MarkAsReadDto extends createZodDto(MarkAsReadSchema) {}

