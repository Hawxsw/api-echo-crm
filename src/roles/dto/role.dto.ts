import { createZodDto } from 'nestjs-zod';
import {
  PermissionSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleResponseSchema,
  AssignRoleSchema,
  CheckPermissionSchema,
} from './role.schema';

/**
 * DTO para permissão individual
 */
export class PermissionDto extends createZodDto(PermissionSchema) {}

/**
 * DTO para criar um novo role
 */
export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}

/**
 * DTO para atualizar um role existente
 */
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}

/**
 * DTO para resposta de role
 */
export class RoleResponseDto extends createZodDto(RoleResponseSchema) {}

/**
 * DTO para atribuir role a um usuário
 */
export class AssignRoleDto extends createZodDto(AssignRoleSchema) {}

/**
 * DTO para verificar permissão
 */
export class CheckPermissionDto extends createZodDto(CheckPermissionSchema) {}

