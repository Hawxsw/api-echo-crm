import { createZodDto } from 'nestjs-zod';
import {
  CreateNotificationSchema,
  MarkAsReadSchema,
  MarkAllAsReadSchema,
} from './notification.schema';

/**
 * DTO para criar notificação
 */
export class CreateNotificationDto extends createZodDto(CreateNotificationSchema) {}

/**
 * DTO para marcar notificações como lidas
 */
export class MarkAsReadDto extends createZodDto(MarkAsReadSchema) {}

/**
 * DTO para marcar todas as notificações como lidas
 */
export class MarkAllAsReadDto extends createZodDto(MarkAllAsReadSchema) {}
