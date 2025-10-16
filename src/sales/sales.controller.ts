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
import { SalesService } from './sales.service';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  CreateStageDto,
  UpdateStageDto,
  MoveStageDto,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  MoveOpportunityDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/sales.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionAction, PermissionResource } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(PermissionsGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('pipelines')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Criar novo pipeline' })
  @ApiResponse({ status: 201, description: 'Pipeline criado com sucesso' })
  createPipeline(
    @Body() createPipelineDto: CreatePipelineDto,
  ) {
    return this.salesService.createPipeline(createPipelineDto);
  }

  @Get('pipelines')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Listar todos os pipelines' })
  @ApiResponse({ status: 200, description: 'Lista de pipelines retornada com sucesso' })
  findAllPipelines() {
    return this.salesService.findAllPipelines();
  }

  @Get('pipelines/:id')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Buscar pipeline por ID' })
  @ApiResponse({ status: 200, description: 'Pipeline encontrado' })
  @ApiResponse({ status: 404, description: 'Pipeline não encontrado' })
  findOnePipeline(
    @Param('id') id: string,
  ) {
    return this.salesService.findOnePipeline(id);
  }

  @Patch('pipelines/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Atualizar pipeline' })
  @ApiResponse({ status: 200, description: 'Pipeline atualizado com sucesso' })
  updatePipeline(
    @Param('id') id: string,
    @Body() updatePipelineDto: UpdatePipelineDto,
  ) {
    return this.salesService.updatePipeline(id, updatePipelineDto);
  }

  @Delete('pipelines/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Remover pipeline' })
  @ApiResponse({ status: 200, description: 'Pipeline removido com sucesso' })
  removePipeline(
    @Param('id') id: string,
  ) {
    return this.salesService.removePipeline(id);
  }

  @Post('pipelines/:pipelineId/stages')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Criar nova etapa' })
  @ApiResponse({ status: 201, description: 'Etapa criada com sucesso' })
  createStage(
    @Param('pipelineId') pipelineId: string,
    @Body() createStageDto: CreateStageDto,
  ) {
    return this.salesService.createStage(pipelineId, createStageDto);
  }

  @Patch('stages/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Atualizar etapa' })
  @ApiResponse({ status: 200, description: 'Etapa atualizada com sucesso' })
  updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.salesService.updateStage(id, updateStageDto);
  }

  @Patch('stages/:id/move')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Mover etapa' })
  @ApiResponse({ status: 200, description: 'Etapa movida com sucesso' })
  moveStage(
    @Param('id') id: string,
    @Body() moveStageDto: MoveStageDto,
  ) {
    return this.salesService.moveStage(id, moveStageDto);
  }

  @Delete('stages/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.SALES_PIPELINE })
  @ApiOperation({ summary: 'Remover etapa' })
  @ApiResponse({ status: 200, description: 'Etapa removida com sucesso' })
  removeStage(
    @Param('id') id: string,
  ) {
    return this.salesService.removeStage(id);
  }

  @Post('opportunities')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Criar nova oportunidade' })
  @ApiResponse({ status: 201, description: 'Oportunidade criada com sucesso' })
  createOpportunity(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.createOpportunity(createOpportunityDto, userId);
  }

  @Get('opportunities/:id')
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Buscar oportunidade por ID' })
  @ApiResponse({ status: 200, description: 'Oportunidade encontrada' })
  @ApiResponse({ status: 404, description: 'Oportunidade não encontrada' })
  findOneOpportunity(
    @Param('id') id: string,
  ) {
    return this.salesService.findOneOpportunity(id);
  }

  @Patch('opportunities/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Atualizar oportunidade' })
  @ApiResponse({ status: 200, description: 'Oportunidade atualizada com sucesso' })
  updateOpportunity(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.updateOpportunity(id, updateOpportunityDto, userId);
  }

  @Patch('opportunities/:id/move')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Mover oportunidade' })
  @ApiResponse({ status: 200, description: 'Oportunidade movida com sucesso' })
  moveOpportunity(
    @Param('id') id: string,
    @Body() moveOpportunityDto: MoveOpportunityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.moveOpportunity(id, moveOpportunityDto, userId);
  }

  @Delete('opportunities/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Remover oportunidade' })
  @ApiResponse({ status: 200, description: 'Oportunidade removida com sucesso' })
  removeOpportunity(
    @Param('id') id: string,
  ) {
    return this.salesService.removeOpportunity(id);
  }

  @Post('opportunities/:opportunityId/comments')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Criar comentário na oportunidade' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  createComment(
    @Param('opportunityId') opportunityId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.createComment(opportunityId, createCommentDto, userId);
  }

  @Patch('comments/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Atualizar comentário' })
  @ApiResponse({ status: 200, description: 'Comentário atualizado com sucesso' })
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.updateComment(id, updateCommentDto, userId);
  }

  @Delete('comments/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Remover comentário' })
  @ApiResponse({ status: 200, description: 'Comentário removido com sucesso' })
  removeComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.removeComment(id, userId);
  }

  @Post('opportunities/:opportunityId/activities')
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Criar atividade na oportunidade' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso' })
  createActivity(
    @Param('opportunityId') opportunityId: string,
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.createActivity(opportunityId, createActivityDto, userId);
  }

  @Patch('activities/:id')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Atualizar atividade' })
  @ApiResponse({ status: 200, description: 'Atividade atualizada com sucesso' })
  updateActivity(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.updateActivity(id, updateActivityDto, userId);
  }

  @Patch('activities/:id/complete')
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Marcar atividade como concluída' })
  @ApiResponse({ status: 200, description: 'Atividade marcada como concluída' })
  completeActivity(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.completeActivity(id, userId);
  }

  @Delete('activities/:id')
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.SALES_OPPORTUNITIES })
  @ApiOperation({ summary: 'Remover atividade' })
  @ApiResponse({ status: 200, description: 'Atividade removida com sucesso' })
  removeActivity(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.removeActivity(id, userId);
  }
}
