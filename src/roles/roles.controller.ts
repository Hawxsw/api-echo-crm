import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam 
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleResponseDto,
  AssignRoleDto,
  CheckPermissionDto 
} from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionAction, PermissionResource } from '@prisma/client';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.CREATE, resource: PermissionResource.ROLES })
  @ApiOperation({ summary: 'Criar um novo role (requer permissão CREATE em ROLES)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Role criado com sucesso',
    type: RoleResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.ROLES })
  @ApiOperation({ summary: 'Listar todos os roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de roles',
    type: [RoleResponseDto] 
  })
  async findAll(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.READ, resource: PermissionResource.ROLES })
  @ApiOperation({ summary: 'Buscar role por ID' })
  @ApiParam({ name: 'id', description: 'ID do role' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role encontrado',
    type: RoleResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Role não encontrado' })
  async findOne(
    @Param('id') id: string,
  ): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.UPDATE, resource: PermissionResource.ROLES })
  @ApiOperation({ summary: 'Atualizar um role (requer permissão UPDATE em ROLES)' })
  @ApiParam({ name: 'id', description: 'ID do role' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role atualizado com sucesso',
    type: RoleResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Não é possível modificar role de sistema ou sem permissão' })
  @ApiResponse({ status: 404, description: 'Role não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.DELETE, resource: PermissionResource.ROLES })
  @ApiOperation({ summary: 'Deletar um role (requer permissão DELETE em ROLES)' })
  @ApiParam({ name: 'id', description: 'ID do role' })
  @ApiResponse({ status: 204, description: 'Role deletado com sucesso' })
  @ApiResponse({ status: 400, description: 'Role possui usuários atribuídos' })
  @ApiResponse({ status: 403, description: 'Não é possível deletar role de sistema ou sem permissão' })
  @ApiResponse({ status: 404, description: 'Role não encontrado' })
  async remove(
    @Param('id') id: string,
  ): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @Permissions({ action: PermissionAction.MANAGE, resource: PermissionResource.USERS })
  @ApiOperation({ summary: 'Atribuir role a um usuário (requer permissão MANAGE em USERS)' })
  @ApiResponse({ status: 200, description: 'Role atribuído com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário ou role não encontrado' })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<{ message: string }> {
    await this.rolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId
    );
    return { message: 'Role atribuído com sucesso' };
  }

  @Post('check-permission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar se usuário tem uma permissão específica' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado da verificação',
    schema: {
      properties: {
        hasPermission: { type: 'boolean' }
      }
    }
  })
  async checkPermission(
    @Body() checkPermissionDto: CheckPermissionDto,
    @CurrentUser() user: any
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.rolesService.checkPermission(
      user.id,
      checkPermissionDto.action,
      checkPermissionDto.resource
    );
    return { hasPermission };
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Obter todas as permissões do usuário atual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de permissões do usuário',
    schema: {
      type: 'array',
      items: {
        properties: {
          action: { type: 'string' },
          resource: { type: 'string' },
          conditions: { type: 'object' }
        }
      }
    }
  })
  async getMyPermissions(@CurrentUser() user: any) {
    return this.rolesService.getUserPermissions(user.id);
  }

  @Post('create-defaults')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar roles padrão (apenas Admin)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Roles padrão criados com sucesso' 
  })
  async createDefaultRoles(): Promise<{ message: string }> {
    await this.rolesService.createDefaultRoles();
    return { message: 'Roles padrão criados com sucesso' };
  }
}

