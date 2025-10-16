import { z } from 'zod';

export const CreateBoardSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CreateColumnSchema = z.object({
  name: z.string().min(1, 'Nome não pode estar vazio'),
  position: z.number().int().min(0),
  color: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const UpdateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
  color: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const MoveColumnSchema = z.object({
  newPosition: z.number().int().min(0),
});

export const CreateCardSchema = z.object({
  title: z.string().min(1, 'Título não pode estar vazio'),
  description: z.string().optional(),
  position: z.number().int().min(0),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
});

export const UpdateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const MoveCardSchema = z.object({
  targetColumnId: z.string().uuid('ID da coluna inválido'),
  newPosition: z.number().int().min(0),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio'),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio'),
});

