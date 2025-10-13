import { z } from 'zod';

/**
 * Schema para paginação
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema factory para resposta paginada
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  });

