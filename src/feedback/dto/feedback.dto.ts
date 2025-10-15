import { createZodDto } from 'nestjs-zod';
import { 
  CreateFeedbackSchema, 
  UpdateFeedbackSchema, 
  FeedbackResponseSchema,
  FeedbackStatsSchema 
} from './feedback.schema';

export class CreateFeedbackDto extends createZodDto(CreateFeedbackSchema) {}

export class UpdateFeedbackDto extends createZodDto(UpdateFeedbackSchema) {}

export class FeedbackResponseDto extends createZodDto(FeedbackResponseSchema) {}

export class FeedbackStatsDto extends createZodDto(FeedbackStatsSchema) {}

