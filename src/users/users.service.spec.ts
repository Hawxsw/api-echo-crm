import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', companyId: '1' },
        { id: '2', email: 'user2@test.com', companyId: '1' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll('1', 1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        companyId: '1',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('1', '1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1', companyId: '1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        companyId: '1',
      };

      const updateDto = { firstName: 'Updated' };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.update('1', updateDto, '1');

      expect(result.firstName).toBe('Updated');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.update('999', {}, '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        companyId: '1',
      };

      const existingUser = {
        id: '2',
        email: 'existing@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.update('1', { email: 'existing@example.com' }, '1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        companyId: '1',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1', '1');

      expect(result.message).toBe('Usuário removido com sucesso');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('999', '1')).rejects.toThrow(NotFoundException);
    });
  });
});

