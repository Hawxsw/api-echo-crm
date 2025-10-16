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

export class CreateBoardDto extends createZodDto(CreateBoardSchema) {}

export class UpdateBoardDto extends createZodDto(UpdateBoardSchema) {}

export class CreateColumnDto extends createZodDto(CreateColumnSchema) {}

export class UpdateColumnDto extends createZodDto(UpdateColumnSchema) {}

export class MoveColumnDto extends createZodDto(MoveColumnSchema) {}

export class CreateCardDto extends createZodDto(CreateCardSchema) {}

export class UpdateCardDto extends createZodDto(UpdateCardSchema) {}

export class MoveCardDto extends createZodDto(MoveCardSchema) {}

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}

export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}

