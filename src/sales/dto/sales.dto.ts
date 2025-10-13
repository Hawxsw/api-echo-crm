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

// ================== Pipeline DTOs ==================

/**
 * DTO para criar pipeline
 */
export class CreatePipelineDto extends createZodDto(CreatePipelineSchema) {}

/**
 * DTO para atualizar pipeline
 */
export class UpdatePipelineDto extends createZodDto(UpdatePipelineSchema) {}

// ================== Stage DTOs ==================

/**
 * DTO para criar estágio
 */
export class CreateStageDto extends createZodDto(CreateStageSchema) {}

/**
 * DTO para atualizar estágio
 */
export class UpdateStageDto extends createZodDto(UpdateStageSchema) {}

/**
 * DTO para mover estágio
 */
export class MoveStageDto extends createZodDto(MoveStageSchema) {}

// ================== Opportunity DTOs ==================

/**
 * DTO para criar oportunidade
 */
export class CreateOpportunityDto extends createZodDto(CreateOpportunitySchema) {}

/**
 * DTO para atualizar oportunidade
 */
export class UpdateOpportunityDto extends createZodDto(UpdateOpportunitySchema) {}

/**
 * DTO para mover oportunidade
 */
export class MoveOpportunityDto extends createZodDto(MoveOpportunitySchema) {}

// ================== Comment DTOs ==================

/**
 * DTO para criar comentário
 */
export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}

/**
 * DTO para atualizar comentário
 */
export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}

// ================== Activity DTOs ==================

/**
 * DTO para criar atividade
 */
export class CreateActivityDto extends createZodDto(CreateActivitySchema) {}

/**
 * DTO para atualizar atividade
 */
export class UpdateActivityDto extends createZodDto(UpdateActivitySchema) {}
