import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { USER_PUBLIC_SELECT, USER_BASIC_SELECT } from './constants/user-selectors.constant';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, _requestingUserId: string) {
    await this.ensureEmailIsUnique(createUserDto.email);

    const hashedPassword = await PasswordUtil.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: USER_BASIC_SELECT,
    });
  }

  private async ensureEmailIsUnique(email: string, excludeId?: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== excludeId) {
      throw new ConflictException('Email já cadastrado');
    }
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
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
      throw new NotFoundException('Usuário não encontrado');
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

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async remove(id: string) {
    await this.ensureUserExists(id);
    await this.prisma.user.delete({ where: { id } });
    
    return { message: 'Usuário removido com sucesso' };
  }
}

