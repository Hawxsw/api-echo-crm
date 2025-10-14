import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AddUserToDepartmentDto,
  MoveDepartmentDto,
  DepartmentResponseDto,
} from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const { parentId, position, ...data } = createDepartmentDto;

    const level = await this.calculateDepartmentLevel(parentId);

    if (position && parentId) {
      await this.adjustSiblingsPositions(parentId, position);
    }

    return this.prisma.department.create({
      data: {
        ...data,
        parentId,
        level,
        position: position ?? 0,
      },
      include: {
        _count: {
          select: { children: true, users: true },
        },
      },
    });
  }

  private async calculateDepartmentLevel(parentId?: string): Promise<number> {
    if (!parentId) return 0;

    const parent = await this.prisma.department.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Departamento pai não encontrado');
    }

    return parent.level + 1;
  }

  private async adjustSiblingsPositions(parentId: string, position: number): Promise<void> {
    await this.prisma.department.updateMany({
      where: {
        parentId,
        position: { gte: position },
      },
      data: {
        position: { increment: 1 },
      },
    });
  }

  async findAll(): Promise<DepartmentResponseDto[]> {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: { children: true, users: true },
        },
      },
      orderBy: [
        { level: 'asc' },
        { position: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          include: {
            _count: {
              select: { users: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            position: true,
            isManager: true,
            isDepartmentHead: true,
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: [
            { isDepartmentHead: 'desc' },
            { isManager: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        managers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            position: true,
          },
        },
        _count: {
          select: { children: true, users: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    return department;
  }

  async getOrganizationalStructure() {
    return this.prisma.department.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                users: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    position: true,
                    isManager: true,
                    isDepartmentHead: true,
                  },
                  orderBy: [
                    { isDepartmentHead: 'desc' },
                    { isManager: 'desc' },
                    { sortOrder: 'asc' },
                  ],
                },
                _count: {
                  select: { users: true },
                },
              },
            },
            users: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                position: true,
                isManager: true,
                isDepartmentHead: true,
              },
              orderBy: [
                { isDepartmentHead: 'desc' },
                { isManager: 'desc' },
                { sortOrder: 'asc' },
              ],
            },
            _count: {
              select: { users: true, children: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            position: true,
            isManager: true,
            isDepartmentHead: true,
          },
          orderBy: [
            { isDepartmentHead: 'desc' },
            { isManager: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: { users: true, children: true },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    await this.ensureDepartmentExists(id);

    if ('parentId' in updateDepartmentDto) {
      return this.moveDepartment(id, {
        newParentId: updateDepartmentDto.parentId || null,
        newPosition: updateDepartmentDto.position,
      });
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        _count: {
          select: { children: true, users: true },
        },
      },
    });

    return updated;
  }

  private async ensureDepartmentExists(id: string): Promise<void> {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }
  }

  async moveDepartment(id: string, moveDepartmentDto: MoveDepartmentDto) {
    const { newParentId, newPosition } = moveDepartmentDto;

    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    if (newParentId && await this.checkForLoop(id, newParentId)) {
      throw new BadRequestException('Não é possível mover um departamento para um de seus subdepartamentos');
    }

    let newLevel = 0;
    if (newParentId) {
      const newParent = await this.prisma.department.findUnique({
        where: { id: newParentId },
      });

      if (!newParent) {
        throw new NotFoundException('Novo departamento pai não encontrado');
      }

      newLevel = newParent.level + 1;
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        parentId: newParentId,
        level: newLevel,
        position: newPosition ?? 0,
      },
      include: {
        _count: {
          select: { children: true, users: true },
        },
      },
    });

    await this.recalculateChildLevels(id);

    return updated;
  }

  private async checkForLoop(departmentId: string, potentialParentId: string): Promise<boolean> {
    if (departmentId === potentialParentId) {
      return true;
    }

    const children = await this.prisma.department.findMany({
      where: { parentId: departmentId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === potentialParentId) {
        return true;
      }
      const hasLoop = await this.checkForLoop(child.id, potentialParentId);
      if (hasLoop) {
        return true;
      }
    }

    return false;
  }

  private async recalculateChildLevels(parentId: string) {
    const parent = await this.prisma.department.findUnique({
      where: { id: parentId },
    });

    if (!parent) return;

    const children = await this.prisma.department.findMany({
      where: { parentId },
    });

    for (const child of children) {
      await this.prisma.department.update({
        where: { id: child.id },
        data: { level: parent.level + 1 },
      });

      await this.recalculateChildLevels(child.id);
    }
  }

  async remove(id: string): Promise<void> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        children: true,
        users: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    if (department.children.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir um departamento que possui subdepartamentos. Remova ou mova os subdepartamentos primeiro.'
      );
    }

    if (department.users.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir um departamento que possui colaboradores. Remova ou mova os colaboradores primeiro.'
      );
    }

    await this.prisma.department.delete({ where: { id } });
  }

  async addUser(addUserDto: AddUserToDepartmentDto) {
    const { userId, departmentId, position, isManager, isDepartmentHead, managerId } = addUserDto;

    await this.validateUserAndDepartment(userId, departmentId);

    if (isDepartmentHead) {
      await this.validateDepartmentHead(departmentId, userId);
    }

    if (managerId) {
      await this.validateManager(managerId);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        departmentId,
        position,
        isManager: isManager ?? false,
        isDepartmentHead: isDepartmentHead ?? false,
        managedDepartmentId: isDepartmentHead ? departmentId : null,
        managerId,
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  private async validateUserAndDepartment(userId: string, departmentId: string): Promise<void> {
    const [department, user] = await Promise.all([
      this.prisma.department.findUnique({ where: { id: departmentId } }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  private async validateDepartmentHead(departmentId: string, userId: string): Promise<void> {
    const existingHead = await this.prisma.user.findFirst({
      where: {
        managedDepartmentId: departmentId,
        isDepartmentHead: true,
      },
    });

    if (existingHead && existingHead.id !== userId) {
      throw new ConflictException('Este departamento já possui um chefe. Remova o chefe atual primeiro.');
    }
  }

  private async validateManager(managerId: string): Promise<void> {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException('Supervisor não encontrado');
    }
  }

  async removeUser(userId: string, departmentId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        departmentId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado neste departamento');
    }

    await this.ensureUserHasNoSubordinates(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        departmentId: null,
        position: null,
        isManager: false,
        isDepartmentHead: false,
        managedDepartmentId: null,
        managerId: null,
      },
    });

    return { message: 'Usuário removido do departamento com sucesso' };
  }

  private async ensureUserHasNoSubordinates(userId: string): Promise<void> {
    const subordinates = await this.prisma.user.count({
      where: { managerId: userId },
    });

    if (subordinates > 0) {
      throw new BadRequestException(
        'Este usuário possui subordinados. Reatribua os subordinados antes de removê-lo.'
      );
    }
  }

  async setDepartmentHead(departmentId: string, userId: string) {
    await this.clearCurrentDepartmentHead(departmentId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        departmentId,
        isDepartmentHead: true,
        isManager: true,
        managedDepartmentId: departmentId,
      },
      include: {
        department: true,
      },
    });
  }

  private async clearCurrentDepartmentHead(departmentId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        managedDepartmentId: departmentId,
        isDepartmentHead: true,
      },
      data: {
        isDepartmentHead: false,
        managedDepartmentId: null,
      },
    });
  }

  async getUserHierarchy(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    const head = await this.prisma.user.findFirst({
      where: {
        managedDepartmentId: departmentId,
        isDepartmentHead: true,
      },
      include: {
        subordinates: {
          include: {
            subordinates: true,
          },
        },
      },
    });

    const usersWithoutManager = await this.prisma.user.findMany({
      where: {
        departmentId,
        managerId: null,
        isDepartmentHead: false,
      },
    });

    return {
      department,
      head,
      usersWithoutManager,
    };
  }
}

