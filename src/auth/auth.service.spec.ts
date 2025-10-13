import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}.${hash.toString('hex')}`;
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIVE',
        role: 'EMPLOYEE',
        companyId: '1',
        departmentId: null,
        company: { id: '1', name: 'Test Company' },
        department: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        status: 'ACTIVE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        status: 'INACTIVE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        companyId: '1',
        role: 'EMPLOYEE' as const,
      };

      const mockCompany = { id: '1', name: 'Test Company' };
      const mockCreatedUser = {
        id: '2',
        ...registerDto,
        password: 'hashed',
        company: mockCompany,
        department: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        companyId: '1',
        role: 'EMPLOYEE' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if company not found', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        companyId: 'nonexistent',
        role: 'EMPLOYEE' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});

