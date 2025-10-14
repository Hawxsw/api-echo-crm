import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '@prisma/client';

export interface RequiredPermission {
  readonly action: PermissionAction;
  readonly resource: PermissionResource;
}

export const PERMISSIONS_KEY = 'permissions' as const;

export const Permissions = (...permissions: readonly RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

