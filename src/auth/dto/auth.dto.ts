import { createZodDto } from 'nestjs-zod';
import { LoginSchema, RegisterSchema, AuthResponseSchema } from './auth.schema';

export class LoginDto extends createZodDto(LoginSchema) {}

export class RegisterDto extends createZodDto(RegisterSchema) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

