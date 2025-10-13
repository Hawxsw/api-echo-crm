import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.findUserWithRole(email);
    if (!user) return null;

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) return null;

    this.ensureUserIsActive(user.status);
    
    return UserMapper.excludePassword(user);
  }

  private async findUserWithRole(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });
  }

  private ensureUserIsActive(status: string): void {
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuário inativo ou suspenso');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.updateLastLogin(user.id);
    const accessToken = this.generateAccessToken(user);
    
    return UserMapper.toAuthResponse(user, accessToken);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto) {
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

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }
  }

  private async createUser(registerDto: RegisterDto, hashedPassword: string) {
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        roleId: registerDto.roleId,
      },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
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
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}

