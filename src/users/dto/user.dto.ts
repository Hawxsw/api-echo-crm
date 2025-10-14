import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema, UpdateUserSchema, UserResponseSchema } from './user.schema';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export class UserResponseDto extends createZodDto(UserResponseSchema) {}

