import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { USER_PUBLIC_SELECT, USER_BASIC_SELECT } from './constants/user-selectors.constant';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, _requestingUserId: string) {
    await this.ensureEmailIsUnique(createUserDto.email);

    const hashedPassword = await PasswordUtil.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        avatar: createUserDto.avatar,
        roleId: createUserDto.roleId,
        departmentId: createUserDto.departmentId,
        managerId: createUserDto.managerId,
        position: createUserDto.position,
      },
      select: USER_BASIC_SELECT,
    });
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: USER_PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.ensureUserExists(id);

    if (updateUserDto.email) {
      await this.ensureEmailIsUnique(updateUserDto.email, id);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: USER_BASIC_SELECT,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ensureUserExists(id);
    
    await this.prisma.user.delete({ where: { id } });
    
    return { message: 'User removed successfully' };
  }

  private async ensureEmailIsUnique(email: string, excludeId?: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== excludeId) {
      throw new ConflictException('Email already registered');
    }
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}

