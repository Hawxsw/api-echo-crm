import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema, UpdateUserSchema, UserResponseSchema } from './user.schema';

/**
 * DTO para criar usuário
 */
export class CreateUserDto extends createZodDto(CreateUserSchema) {}

/**
 * DTO para atualizar usuário
 */
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

/**
 * DTO para resposta de usuário
 */
export class UserResponseDto extends createZodDto(UserResponseSchema) {}

