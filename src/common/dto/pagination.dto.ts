import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from './pagination.schema';

/**
 * DTO para paginação
 */
export class PaginationDto extends createZodDto(PaginationSchema) {}

// Re-export do schema para uso externo
export { PaginationSchema, PaginatedResponseSchema } from './pagination.schema';

