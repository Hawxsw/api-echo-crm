import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * @deprecated Use PermissionsGuard instead. This guard is kept for backwards compatibility.
 * The new system uses dynamic roles with granular permissions.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Check if user has a role assigned
    if (!user.role || !user.role.name) {
      return false;
    }
    
    // Check if user's role name matches any of the required roles
    return requiredRoles.some((roleName) => user.role.name === roleName);
  }
}

