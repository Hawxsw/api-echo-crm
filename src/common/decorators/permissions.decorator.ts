import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '@prisma/client';

export interface RequiredPermission {
  action: PermissionAction;
  resource: PermissionResource;
}

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator para proteger rotas com base em permissões
 * @param permissions - Array de permissões necessárias
 * 
 * @example
 * @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.USERS })
 * @Permissions({ action: PermissionAction.MANAGE, resource: PermissionResource.KANBAN_BOARDS })
 */
export const Permissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

