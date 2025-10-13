import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.create(createUserDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  findAll(
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(
    @Param('id') id: string,
  ) {
    return this.usersService.remove(id);
  }
}

