import { z } from 'nestjs-zod/z';

export const CreateTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const UpdateTicketSchema = z.object({
  subject: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
});

export const TicketResponseSchema = z.object({
  id: z.string().uuid(),
  subject: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  userId: z.string().uuid(),
  assignedTo: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateFAQSchema = z.object({
  question: z.string().min(10).max(500),
  answer: z.string().min(10).max(5000),
  category: z.string().min(2).max(50),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateFAQSchema = z.object({
  question: z.string().min(10).max(500).optional(),
  answer: z.string().min(10).max(5000).optional(),
  category: z.string().min(2).max(50).optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const FAQResponseSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  views: z.number(),
  isActive: z.boolean(),
  position: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

