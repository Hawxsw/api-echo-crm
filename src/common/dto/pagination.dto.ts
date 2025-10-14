import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from './pagination.schema';

export class PaginationDto extends createZodDto(PaginationSchema) {}

export { PaginationSchema, PaginatedResponseSchema, type PaginationInput, type PaginatedResponse } from './pagination.schema';

