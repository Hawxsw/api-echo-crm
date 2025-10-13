import { createZodDto } from 'nestjs-zod';
import { LoginSchema, RegisterSchema, AuthResponseSchema } from './auth.schema';

/**
 * DTO para login
 */
export class LoginDto extends createZodDto(LoginSchema) {}

/**
 * DTO para registro de novo usuário
 */
export class RegisterDto extends createZodDto(RegisterSchema) {}

/**
 * DTO para resposta de autenticação
 */
export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

