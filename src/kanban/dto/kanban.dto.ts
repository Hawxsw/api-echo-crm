import { createZodDto } from 'nestjs-zod';
import {
  CreateBoardSchema,
  UpdateBoardSchema,
  CreateColumnSchema,
  UpdateColumnSchema,
  MoveColumnSchema,
  CreateCardSchema,
  UpdateCardSchema,
  MoveCardSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from './kanban.schema';

// ================== Board DTOs ==================

/**
 * DTO para criar board
 */
export class CreateBoardDto extends createZodDto(CreateBoardSchema) {}

/**
 * DTO para atualizar board
 */
export class UpdateBoardDto extends createZodDto(UpdateBoardSchema) {}

// ================== Column DTOs ==================

/**
 * DTO para criar coluna
 */
export class CreateColumnDto extends createZodDto(CreateColumnSchema) {}

/**
 * DTO para atualizar coluna
 */
export class UpdateColumnDto extends createZodDto(UpdateColumnSchema) {}

/**
 * DTO para mover coluna
 */
export class MoveColumnDto extends createZodDto(MoveColumnSchema) {}

// ================== Card DTOs ==================

/**
 * DTO para criar card
 */
export class CreateCardDto extends createZodDto(CreateCardSchema) {}

/**
 * DTO para atualizar card
 */
export class UpdateCardDto extends createZodDto(UpdateCardSchema) {}

/**
 * DTO para mover card
 */
export class MoveCardDto extends createZodDto(MoveCardSchema) {}

// ================== Comment DTOs ==================

/**
 * DTO para criar comentário
 */
export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}

/**
 * DTO para atualizar comentário
 */
export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}

