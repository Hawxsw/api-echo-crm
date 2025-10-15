import { createZodDto } from 'nestjs-zod';
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  TicketResponseSchema,
  CreateFAQSchema,
  UpdateFAQSchema,
  FAQResponseSchema,
} from './support.schema';

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {}

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {}

export class TicketResponseDto extends createZodDto(TicketResponseSchema) {}

export class CreateFAQDto extends createZodDto(CreateFAQSchema) {}

export class UpdateFAQDto extends createZodDto(UpdateFAQSchema) {}

export class FAQResponseDto extends createZodDto(FAQResponseSchema) {}

