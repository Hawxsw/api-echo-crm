import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @deprecated Use @Permissions decorator instead. This decorator is kept for backwards compatibility.
 * The new system uses dynamic roles with granular permissions.
 * 
 * @param roles - Array of role names (e.g., 'Super Admin', 'Gerente', 'Colaborador')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

