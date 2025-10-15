import { z } from 'nestjs-zod/z';

export const CreateFeedbackSchema = z.object({
  type: z.enum(['SUGGESTION', 'BUG', 'COMPLIMENT', 'COMPLAINT']),
  category: z.enum(['UI', 'PERFORMANCE', 'FEATURE', 'INTEGRATION', 'DOCUMENTATION', 'OTHER']),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  rating: z.number().int().min(0).max(5),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  isAnonymous: z.boolean().optional(),
});

export const UpdateFeedbackSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'FIXED', 'ACKNOWLEDGED']).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const FeedbackResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  rating: z.number(),
  priority: z.string(),
  status: z.string(),
  isAnonymous: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  votesCount: z.number().optional(),
  hasVoted: z.boolean().optional(),
});

export const FeedbackStatsSchema = z.object({
  total: z.number(),
  thisMonth: z.number(),
  averageRating: z.number(),
  byType: z.record(z.number()),
  byStatus: z.record(z.number()),
});

