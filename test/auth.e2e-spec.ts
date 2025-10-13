import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test (only in test environment)
    if (process.env.NODE_ENV === 'test') {
      await prisma.cleanDatabase();
    }
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should register a new user with company', async () => {
      // First create a company
      const company = await prisma.company.create({
        data: {
          name: 'Test Company',
          email: 'test@company.com',
        },
      });

      const registerDto = {
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: company.id,
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.user.email).toBe(registerDto.email);
      expect(response.body.data.user.firstName).toBe(registerDto.firstName);
    });

    it('should return 409 if email already exists', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      const registerDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: company.id,
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should return 400 for invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: 'some-id',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      const registerDto = {
        email: 'logintest@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'Test',
        companyId: company.id,
      };

      // Register first
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto);

      // Then login
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(201);

      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.user.email).toBe(registerDto.email);
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/profile (GET)', () => {
    it('should return user profile with valid token', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company' },
      });

      const registerDto = {
        email: 'profile@example.com',
        password: 'password123',
        firstName: 'Profile',
        lastName: 'Test',
        companyId: company.id,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto);

      const token = registerResponse.body.data.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.email).toBe(registerDto.email);
      expect(response.body.data.company).toBeDefined();
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });
  });
});

