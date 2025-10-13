import { z } from 'zod';

/**
 * Schema para login
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/**
 * Schema para registro de novo usuário
 */
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  firstName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  roleId: z.string().uuid('ID do role inválido').optional(),
});

/**
 * Schema para resposta de autenticação
 */
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
  }),
});

