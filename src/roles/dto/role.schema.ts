import { z } from 'zod';
import { PermissionAction, PermissionResource } from '@prisma/client';

/**
 * Schema para permissão individual
 */
export const PermissionSchema = z.object({
  action: z.nativeEnum(PermissionAction, {
    errorMap: () => ({ message: 'Ação inválida. Use: CREATE, READ, UPDATE, DELETE ou MANAGE' }),
  }),
  resource: z.nativeEnum(PermissionResource, {
    errorMap: () => ({ message: 'Recurso inválido' }),
  }),
  conditions: z.record(z.any()).optional(),
});

/**
 * Schema para criar um novo role
 */
export const CreateRoleSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  permissions: z
    .array(PermissionSchema, {
      required_error: 'Permissões são obrigatórias',
    })
    .min(1, 'Deve haver pelo menos uma permissão'),
});

/**
 * Schema para atualizar um role existente
 */
export const UpdateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  permissions: z
    .array(PermissionSchema)
    .min(1, 'Deve haver pelo menos uma permissão')
    .optional(),
});

/**
 * Schema para resposta de role
 */
export const RoleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  permissions: z.array(PermissionSchema),
  userCount: z.number().optional(),
});

/**
 * Schema para atribuir role a um usuário
 */
export const AssignRoleSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  roleId: z.string().uuid('ID do role inválido'),
});

/**
 * Schema para verificar permissão
 */
export const CheckPermissionSchema = z.object({
  action: z.nativeEnum(PermissionAction),
  resource: z.nativeEnum(PermissionResource),
});

