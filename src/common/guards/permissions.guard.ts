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

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!userWithRole || !userWithRole.role) {
      throw new ForbiddenException('Usuário sem role atribuído');
    }

    const userPermissions = userWithRole.role.permissions;

    // Verificar se tem permissão de MANAGE em ALL (super admin)
    const isSuperAdmin = userPermissions.some(
      p => p.action === PermissionAction.MANAGE && p.resource === PermissionResource.ALL
    );

    if (isSuperAdmin) {
      return true;
    }

    // Verificar cada permissão necessária
    const hasAllPermissions = requiredPermissions.every(required => {
      return userPermissions.some(userPerm => {
        // Verificar se tem permissão MANAGE no recurso específico
        if (userPerm.action === PermissionAction.MANAGE && userPerm.resource === required.resource) {
          return true;
        }

        // Verificar permissão específica
        return (
          userPerm.action === required.action &&
          userPerm.resource === required.resource
        );
      });
    });

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Você não possui permissões suficientes para realizar esta ação'
      );
    }

    return true;
  }
}

