import { z } from 'nestjs-zod/z';

export const UpdateSettingsSchema = z.object({
  // Notification settings
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingNotifications: z.boolean().optional(),
  
  // Security settings
  twoFactorAuth: z.boolean().optional(),
  sessionTimeout: z.number().int().min(5).max(480).optional(),
  passwordPolicy: z.enum(['low', 'medium', 'high', 'strict']).optional(),
  
  // Appearance settings
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).optional(),
  timezone: z.string().optional(),
  
  // System settings
  autoSave: z.boolean().optional(),
  dataRetention: z.number().int().min(30).max(730).optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

export const SettingsResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingNotifications: z.boolean(),
  
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.number(),
  passwordPolicy: z.string(),
  
  theme: z.string(),
  language: z.string(),
  timezone: z.string(),
  
  autoSave: z.boolean(),
  dataRetention: z.number(),
  backupFrequency: z.string(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

