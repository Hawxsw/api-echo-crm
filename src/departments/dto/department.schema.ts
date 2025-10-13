import { z } from 'zod';

/**
 * Schema para criar departamento
 */
export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato hex: #RRGGBB)').optional(),
  icon: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * Schema para atualizar departamento
 */
export const UpdateDepartmentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema para adicionar colaborador ao departamento
 */
export const AddUserToDepartmentSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  departmentId: z.string().uuid('ID do departamento inválido'),
  position: z.string().optional(), // Cargo/função
  isManager: z.boolean().optional(),
  isDepartmentHead: z.boolean().optional(),
  managerId: z.string().uuid().optional(), // Supervisor
});

/**
 * Schema para mover departamento na hierarquia
 */
export const MoveDepartmentSchema = z.object({
  newParentId: z.string().uuid().nullable(),
  newPosition: z.number().int().min(0).optional(),
});

