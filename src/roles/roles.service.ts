import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto/role.dto';
import { PermissionAction, PermissionResource } from '@prisma/client';
import { PermissionHelper } from './helpers/permission.helper';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    await this.ensureRoleNameIsUnique(createRoleDto.name);

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissions: {
          create: createRoleDto.permissions.map((permission) => ({
            action: permission.action,
            resource: permission.resource,
            conditions: permission.conditions,
          })),
        },
      },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return this.transformToResponse(role);
  }

  private async ensureRoleNameIsUnique(name: string, excludeId?: string): Promise<void> {
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole && existingRole.id !== excludeId) {
      throw new ConflictException(`Já existe um role com o nome "${name}"`);
    }
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roles.map((role) => this.transformToResponse(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role com ID ${id} não encontrado`);
    }

    return this.transformToResponse(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.findRoleById(id);
    this.ensureRoleIsNotSystem(role);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      await this.ensureRoleNameIsUnique(updateRoleDto.name, id);
    }

    const updateData = this.buildUpdateData(updateRoleDto);

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return this.transformToResponse(updatedRole);
  }

  private async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role com ID ${id} não encontrado`);
    }

    return role;
  }

  private ensureRoleIsNotSystem(role: any): void {
    if (role.isSystem) {
      throw new ForbiddenException('Não é possível modificar um role de sistema');
    }
  }

  private buildUpdateData(updateRoleDto: UpdateRoleDto) {
    const updateData: any = {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
    };

    if (updateRoleDto.permissions) {
      updateData.permissions = {
        deleteMany: {},
        create: updateRoleDto.permissions.map((permission) => ({
          action: permission.action,
          resource: permission.resource,
          conditions: permission.conditions,
        })),
      };
    }

    return updateData;
  }

  async remove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role com ID ${id} não encontrado`);
    }

    this.ensureRoleIsNotSystem(role);
    this.ensureRoleHasNoUsers(role);

    await this.prisma.role.delete({
      where: { id },
    });
  }

  private ensureRoleHasNoUsers(role: any): void {
    if (role._count.users > 0) {
      throw new BadRequestException(
        `Não é possível deletar este role pois ${role._count.users} usuário(s) estão atribuídos a ele. ` +
          'Remova ou reatribua estes usuários primeiro.'
      );
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await this.ensureUserExists(userId);
    await this.findRoleById(roleId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
  }

  async checkPermission(
    userId: string,
    action: PermissionAction,
    resource: PermissionResource
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user?.role) return false;

    return PermissionHelper.checkPermission(user.role.permissions, action, resource);
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user?.role) return [];

    return user.role.permissions.map((p) => ({
      action: p.action,
      resource: p.resource,
      conditions: p.conditions,
    }));
  }

  async createDefaultRoles(): Promise<void> {
    await Promise.all([
      this.createSuperAdminRole(),
      this.createManagerRole(),
      this.createCollaboratorRole(),
    ]);
  }

  private async createSuperAdminRole() {
    return this.prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Acesso total ao sistema',
        isSystem: true,
        permissions: {
          create: [
            {
              action: PermissionAction.MANAGE,
              resource: PermissionResource.ALL,
            },
          ],
        },
      },
    });
  }

  private async createManagerRole() {
    return this.prisma.role.create({
      data: {
        name: 'Gerente',
        description: 'Gerencia equipes e recursos',
        isSystem: true,
        permissions: {
          create: [
            { action: PermissionAction.READ, resource: PermissionResource.USERS },
            { action: PermissionAction.UPDATE, resource: PermissionResource.USERS },
            { action: PermissionAction.MANAGE, resource: PermissionResource.KANBAN_BOARDS },
            { action: PermissionAction.MANAGE, resource: PermissionResource.KANBAN_CARDS },
            { action: PermissionAction.READ, resource: PermissionResource.REPORTS },
            { action: PermissionAction.MANAGE, resource: PermissionResource.WHATSAPP },
          ],
        },
      },
    });
  }

  private async createCollaboratorRole() {
    return this.prisma.role.create({
      data: {
        name: 'Colaborador',
        description: 'Acesso básico ao sistema',
        isSystem: true,
        permissions: {
          create: [
            { action: PermissionAction.READ, resource: PermissionResource.KANBAN_BOARDS },
            { action: PermissionAction.CREATE, resource: PermissionResource.KANBAN_CARDS },
            { action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_CARDS },
            { action: PermissionAction.READ, resource: PermissionResource.CHAT },
            { action: PermissionAction.CREATE, resource: PermissionResource.CHAT },
          ],
        },
      },
    });
  }

  private transformToResponse(role: any): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((p: { action: string; resource: string; conditions: unknown }) => ({
        action: p.action,
        resource: p.resource,
        conditions: p.conditions,
      })),
      userCount: role._count?.users,
    };
  }
}

