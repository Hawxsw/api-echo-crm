import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KanbanService } from './kanban.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateColumnDto,
  UpdateColumnDto,
  MoveColumnDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/kanban.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionAction, PermissionResource } from '@prisma/client';

@ApiTags('kanban')
@ApiBearerAuth()
@Controller('kanban')
@UseGuards(PermissionsGuard)
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  // ============ BOARD ENDPOINTS ============
  @Post('boards')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Criar novo board' })
  @ApiResponse({ status: 201, description: 'Board criado com sucesso' })
  createBoard(
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.kanbanService.createBoard(createBoardDto);
  }

  @Get('boards')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Listar todos os boards' })
  @ApiResponse({ status: 200, description: 'Lista de boards retornada com sucesso' })
  findAllBoards() {
    return this.kanbanService.findAllBoards();
  }

  @Get('boards/:id')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Buscar board por ID' })
  @ApiResponse({ status: 200, description: 'Board encontrado' })
  @ApiResponse({ status: 404, description: 'Board não encontrado' })
  findOneBoard(
    @Param('id') id: string,
  ) {
    return this.kanbanService.findOneBoard(id);
  }

  @Patch('boards/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Atualizar board' })
  @ApiResponse({ status: 200, description: 'Board atualizado com sucesso' })
  updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.kanbanService.updateBoard(id, updateBoardDto);
  }

  @Delete('boards/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Remover board' })
  @ApiResponse({ status: 200, description: 'Board removido com sucesso' })
  removeBoard(
    @Param('id') id: string,
  ) {
    return this.kanbanService.removeBoard(id);
  }

  // ============ COLUMN ENDPOINTS ============
  @Post('boards/:boardId/columns')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Criar nova coluna' })
  @ApiResponse({ status: 201, description: 'Coluna criada com sucesso' })
  createColumn(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.kanbanService.createColumn(boardId, createColumnDto);
  }

  @Patch('columns/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Atualizar coluna' })
  @ApiResponse({ status: 200, description: 'Coluna atualizada com sucesso' })
  updateColumn(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.kanbanService.updateColumn(id, updateColumnDto);
  }

  @Patch('columns/:id/move')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Mover coluna' })
  @ApiResponse({ status: 200, description: 'Coluna movida com sucesso' })
  moveColumn(
    @Param('id') id: string,
    @Body() moveColumnDto: MoveColumnDto,
  ) {
    return this.kanbanService.moveColumn(id, moveColumnDto);
  }

  @Delete('columns/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.KANBAN_BOARDS })
  @ApiOperation({ summary: 'Remover coluna' })
  @ApiResponse({ status: 200, description: 'Coluna removida com sucesso' })
  removeColumn(
    @Param('id') id: string,
  ) {
    return this.kanbanService.removeColumn(id);
  }

  // ============ CARD ENDPOINTS ============
  @Post('columns/:columnId/cards')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Criar novo card' })
  @ApiResponse({ status: 201, description: 'Card criado com sucesso' })
  createCard(
    @Param('columnId') columnId: string,
    @Body() createCardDto: CreateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.createCard(columnId, createCardDto, userId);
  }

  @Get('cards/:id')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Buscar card por ID' })
  @ApiResponse({ status: 200, description: 'Card encontrado' })
  findOneCard(
    @Param('id') id: string,
  ) {
    return this.kanbanService.findOneCard(id);
  }

  @Patch('cards/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Atualizar card' })
  @ApiResponse({ status: 200, description: 'Card atualizado com sucesso' })
  updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.updateCard(id, updateCardDto, userId);
  }

  @Patch('cards/:id/move')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Mover card' })
  @ApiResponse({ status: 200, description: 'Card movido com sucesso' })
  moveCard(
    @Param('id') id: string,
    @Body() moveCardDto: MoveCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.moveCard(id, moveCardDto, userId);
  }

  @Delete('cards/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Remover card' })
  @ApiResponse({ status: 200, description: 'Card removido com sucesso' })
  removeCard(
    @Param('id') id: string,
  ) {
    return this.kanbanService.removeCard(id);
  }

  // ============ COMMENT ENDPOINTS ============
  @Post('cards/:cardId/comments')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Criar comentário no card' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  createComment(
    @Param('cardId') cardId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.createComment(cardId, createCommentDto, userId);
  }

  @Patch('comments/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Atualizar comentário' })
  @ApiResponse({ status: 200, description: 'Comentário atualizado com sucesso' })
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.updateComment(id, updateCommentDto, userId);
  }

  @Delete('comments/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.KANBAN_CARDS })
  @ApiOperation({ summary: 'Remover comentário' })
  @ApiResponse({ status: 200, description: 'Comentário removido com sucesso' })
  removeComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.kanbanService.removeComment(id, userId);
  }
}

