import { createZodDto } from 'nestjs-zod';
import {
  PermissionSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleResponseSchema,
  AssignRoleSchema,
  CheckPermissionSchema,
} from './role.schema';

export class PermissionDto extends createZodDto(PermissionSchema) {}

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}

export class RoleResponseDto extends createZodDto(RoleResponseSchema) {}

export class AssignRoleDto extends createZodDto(AssignRoleSchema) {}

export class CheckPermissionDto extends createZodDto(CheckPermissionSchema) {}

