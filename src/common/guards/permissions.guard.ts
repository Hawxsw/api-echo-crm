import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { PermissionAction, PermissionResource } from '@prisma/client';

interface RequestUser {
  id: string;
}

const USER_PERMISSIONS_SELECT = {
  include: {
    role: {
      include: {
        permissions: {
          select: {
            action: true,
            resource: true,
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<readonly RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      ...USER_PERMISSIONS_SELECT,
    });

    if (!userWithRole?.role) {
      throw new ForbiddenException('User has no assigned role');
    }

    const userPermissions = userWithRole.role.permissions;

    if (this.isSuperAdmin(userPermissions)) {
      return true;
    }

    if (!this.hasRequiredPermissions(requiredPermissions, userPermissions)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private isSuperAdmin(permissions: Array<{ action: PermissionAction; resource: PermissionResource }>): boolean {
    return permissions.some(
      p => p.action === PermissionAction.MANAGE && p.resource === PermissionResource.ALL
    );
  }

  private hasRequiredPermissions(
    required: readonly RequiredPermission[],
    userPerms: Array<{ action: PermissionAction; resource: PermissionResource }>
  ): boolean {
    return required.every(req =>
      userPerms.some(perm =>
        (perm.action === PermissionAction.MANAGE && perm.resource === req.resource) ||
        (perm.action === req.action && perm.resource === req.resource)
      )
    );
  }
}

