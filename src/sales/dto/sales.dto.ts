import { createZodDto } from 'nestjs-zod';
import {
  CreatePipelineSchema,
  UpdatePipelineSchema,
  CreateStageSchema,
  UpdateStageSchema,
  MoveStageSchema,
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  MoveOpportunitySchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  CreateActivitySchema,
  UpdateActivitySchema,
} from './sales.schema';

export class CreatePipelineDto extends createZodDto(CreatePipelineSchema) {}

export class UpdatePipelineDto extends createZodDto(UpdatePipelineSchema) {}

export class CreateStageDto extends createZodDto(CreateStageSchema) {}

export class UpdateStageDto extends createZodDto(UpdateStageSchema) {}

export class MoveStageDto extends createZodDto(MoveStageSchema) {}

export class CreateOpportunityDto extends createZodDto(CreateOpportunitySchema) {}

export class UpdateOpportunityDto extends createZodDto(UpdateOpportunitySchema) {}

export class MoveOpportunityDto extends createZodDto(MoveOpportunitySchema) {}

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}

export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}

export class CreateActivityDto extends createZodDto(CreateActivitySchema) {}

export class UpdateActivityDto extends createZodDto(UpdateActivitySchema) {}
