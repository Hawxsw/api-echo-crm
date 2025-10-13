import { z } from 'zod';

// ============ PIPELINE SCHEMAS ============

export const CreatePipelineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
});

export const UpdatePipelineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============ STAGE SCHEMAS ============

export const CreateStageSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  position: z.number().int().min(0, 'Posição deve ser um número positivo'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido').optional(),
});

export const UpdateStageSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  position: z.number().int().min(0, 'Posição deve ser um número positivo').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido').optional(),
});

export const MoveStageSchema = z.object({
  newPosition: z.number().int().min(0, 'Posição deve ser um número positivo'),
});

// ============ OPPORTUNITY SCHEMAS ============

export const CreateOpportunitySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  company: z.string().min(1, 'Empresa é obrigatória'),
  contact: z.string().min(1, 'Contato é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  value: z.number().min(0, 'Valor deve ser positivo').optional(),
  stageId: z.string().uuid('ID do estágio inválido'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().uuid('ID do usuário inválido').optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateOpportunitySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  company: z.string().min(1, 'Empresa é obrigatória').optional(),
  contact: z.string().min(1, 'Contato é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  value: z.number().min(0, 'Valor deve ser positivo').optional(),
  stageId: z.string().uuid('ID do estágio inválido').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().uuid('ID do usuário inválido').optional(),
  tags: z.array(z.string()).optional(),
});

export const MoveOpportunitySchema = z.object({
  stageId: z.string().uuid('ID do estágio inválido'),
  position: z.number().int().min(0, 'Posição deve ser um número positivo').optional(),
});

// ============ COMMENT SCHEMAS ============

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo do comentário é obrigatório'),
  isPinned: z.boolean().optional(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo do comentário é obrigatório').optional(),
  isPinned: z.boolean().optional(),
});

// ============ ACTIVITY SCHEMAS ============

export const CreateActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  scheduledDate: z.string().datetime('Data agendada inválida'),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:mm'),
  assignedToId: z.string().uuid('ID do usuário inválido'),
});

export const UpdateActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']).optional(),
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  scheduledDate: z.string().datetime('Data agendada inválida').optional(),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:mm').optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  completedDate: z.string().datetime('Data de conclusão inválida').optional(),
  completedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:mm').optional(),
});
