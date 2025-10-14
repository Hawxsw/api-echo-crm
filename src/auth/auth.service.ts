import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { UserMapper } from './mappers/user.mapper';
import { AuthResponse } from './dto/auth.schema';

type UserWithRole = User & {
  role: {
    id: string;
    name: string;
    permissions: Array<{
      action: string;
      resource: string;
      conditions: unknown;
    }>;
  } | null;
};

const USER_WITH_ROLE_SELECT = {
  include: {
    role: {
      include: {
        permissions: {
          select: {
            action: true,
            resource: true,
            conditions: true,
          },
        },
      },
    },
  },
} as const;

const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  phone: true,
  status: true,
  createdAt: true,
  lastLoginAt: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
      permissions: {
        select: {
          action: true,
          resource: true,
          conditions: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<UserWithRole, 'password'> | null> {
    const user = await this.findUserWithRole(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    this.ensureUserIsActive(user.status);
    
    return UserMapper.excludePassword(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.updateLastLogin(user.id);
    const accessToken = this.generateAccessToken(user);
    
    return UserMapper.toAuthResponse(user, accessToken);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    await this.ensureEmailIsUnique(registerDto.email);

    const hashedPassword = await PasswordUtil.hash(registerDto.password);
    const user = await this.createUser(registerDto, hashedPassword);
    const userWithoutPassword = UserMapper.excludePassword(user);
    const accessToken = this.generateAccessToken(userWithoutPassword);
    
    return {
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PROFILE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async findUserWithRole(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { email },
      ...USER_WITH_ROLE_SELECT,
    });
  }

  private ensureUserIsActive(status: UserStatus): void {
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException('User is inactive or suspended');
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  private generateAccessToken(user: Omit<UserWithRole, 'password'>): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
  }

  private async createUser(registerDto: RegisterDto, hashedPassword: string): Promise<UserWithRole> {
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        roleId: registerDto.roleId,
      },
      ...USER_WITH_ROLE_SELECT,
    });
  }
}

