import { z } from 'zod';
import { UserStatus } from '@prisma/client';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid URL format').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  managerId: z.string().uuid('Invalid manager ID').optional(),
  position: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid URL format').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  status: z.nativeEnum(UserStatus).optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  managerId: z.string().uuid('Invalid manager ID').optional(),
  position: z.string().optional(),
  isManager: z.boolean().optional(),
  isDepartmentHead: z.boolean().optional(),
});

const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable(),
  phone: z.string().nullable(),
  role: RoleSchema.nullable(),
  status: z.nativeEnum(UserStatus),
  position: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

