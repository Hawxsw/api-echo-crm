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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AddUserToDepartmentDto,
  MoveDepartmentDto,
  DepartmentResponseDto,
} from './dto/department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Criar novo departamento' })
  @ApiResponse({ 
    status: 201, 
    description: 'Departamento criado com sucesso',
    type: DepartmentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Departamento pai não encontrado' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os departamentos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de departamentos',
    type: [DepartmentResponseDto] 
  })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('organizational-structure')
  @ApiOperation({ summary: 'Obter estrutura organizacional completa (organograma)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estrutura organizacional em árvore' 
  })
  getOrganizationalStructure() {
    return this.departmentsService.getOrganizationalStructure();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Departamento encontrado',
    type: DepartmentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Obter hierarquia de usuários do departamento' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Hierarquia de usuários' 
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  getUserHierarchy(@Param('id') id: string) {
    return this.departmentsService.getUserHierarchy(id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Atualizar departamento' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Departamento atualizado com sucesso',
    type: DepartmentResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Patch(':id/move')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Mover departamento na hierarquia' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Departamento movido com sucesso',
    type: DepartmentResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Movimento inválido (criaria loop)' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  move(
    @Param('id') id: string,
    @Body() moveDepartmentDto: MoveDepartmentDto,
  ) {
    return this.departmentsService.moveDepartment(id, moveDepartmentDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover departamento' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ status: 204, description: 'Departamento removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Departamento possui subdepartamentos ou colaboradores' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Post('add-user')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Adicionar colaborador ao departamento' })
  @ApiResponse({ status: 200, description: 'Colaborador adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Departamento ou usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Departamento já possui um chefe' })
  addUser(@Body() addUserDto: AddUserToDepartmentDto) {
    return this.departmentsService.addUser(addUserDto);
  }

  @Delete(':departmentId/users/:userId')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Remover colaborador do departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID do departamento' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Colaborador removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário possui subordinados' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado neste departamento' })
  removeUser(
    @Param('userId') userId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.departmentsService.removeUser(userId, departmentId);
  }

  @Post(':id/set-head/:userId')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Definir chefe do departamento' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiParam({ name: 'userId', description: 'ID do usuário que será o chefe' })
  @ApiResponse({ status: 200, description: 'Chefe definido com sucesso' })
  @ApiResponse({ status: 404, description: 'Departamento ou usuário não encontrado' })
  setDepartmentHead(
    @Param('id') departmentId: string,
    @Param('userId') userId: string,
  ) {
    return this.departmentsService.setDepartmentHead(departmentId, userId);
  }
}

