import { z } from 'zod';

/**
 * Schema para criar usuário
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  firstName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.string().uuid('ID do role inválido').optional(),
});

/**
 * Schema para atualizar usuário
 */
export const UpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.string().uuid('ID do role inválido').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

/**
 * Schema para resposta de usuário
 */
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

