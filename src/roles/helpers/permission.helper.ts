import { PermissionAction, PermissionResource } from '@prisma/client';

export class PermissionHelper {
  static isSuperAdmin(permissions: any[]): boolean {
    return permissions.some(
      (p) => p.action === PermissionAction.MANAGE && p.resource === PermissionResource.ALL
    );
  }

  static hasManagePermission(permissions: any[], resource: PermissionResource): boolean {
    return permissions.some(
      (p) => p.action === PermissionAction.MANAGE && p.resource === resource
    );
  }

  static hasSpecificPermission(
    permissions: any[],
    action: PermissionAction,
    resource: PermissionResource
  ): boolean {
    return permissions.some((p) => p.action === action && p.resource === resource);
  }

  static checkPermission(
    permissions: any[],
    action: PermissionAction,
    resource: PermissionResource
  ): boolean {
    if (this.isSuperAdmin(permissions)) return true;
    if (this.hasManagePermission(permissions, resource)) return true;
    return this.hasSpecificPermission(permissions, action, resource);
  }
}

