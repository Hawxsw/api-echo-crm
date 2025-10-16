import { createZodDto } from 'nestjs-zod';
import {
  CreateNotificationSchema,
  MarkAsReadSchema,
  MarkAllAsReadSchema,
} from './notification.schema';

export class CreateNotificationDto extends createZodDto(CreateNotificationSchema) {}

export class MarkAsReadDto extends createZodDto(MarkAsReadSchema) {}

export class MarkAllAsReadDto extends createZodDto(MarkAllAsReadSchema) {}
