import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Nome do departamento', example: 'Tecnologia da Informação' })
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do departamento', example: 'Equipe de desenvolvimento e infraestrutura' })
  description?: string;

  @ApiPropertyOptional({ description: 'ID do departamento pai', example: 'uuid-do-pai' })
  parentId?: string;

  @ApiPropertyOptional({ description: 'Cor do departamento em hex', example: '#3B82F6' })
  color?: string;

  @ApiPropertyOptional({ description: 'Ícone do departamento', example: 'Code' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Posição horizontal no organograma', example: 0 })
  position?: number;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'Nome do departamento' })
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do departamento' })
  description?: string;

  @ApiPropertyOptional({ description: 'ID do departamento pai (null para raiz)' })
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Cor do departamento em hex' })
  color?: string;

  @ApiPropertyOptional({ description: 'Ícone do departamento' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Posição horizontal no organograma' })
  position?: number;

  @ApiPropertyOptional({ description: 'Se o departamento está ativo' })
  isActive?: boolean;
}

export class AddUserToDepartmentDto {
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'ID do departamento' })
  departmentId: string;

  @ApiPropertyOptional({ description: 'Cargo/função do usuário', example: 'Desenvolvedor Full Stack' })
  position?: string;

  @ApiPropertyOptional({ description: 'Se é gerente/supervisor', example: false })
  isManager?: boolean;

  @ApiPropertyOptional({ description: 'Se é chefe do departamento', example: false })
  isDepartmentHead?: boolean;

  @ApiPropertyOptional({ description: 'ID do supervisor direto' })
  managerId?: string;
}

export class MoveDepartmentDto {
  @ApiProperty({ description: 'Novo ID do departamento pai (null para raiz)', nullable: true })
  newParentId: string | null;

  @ApiPropertyOptional({ description: 'Nova posição no organograma' })
  newPosition?: number;
}

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  parentId?: string | null;

  @ApiProperty()
  level: number;

  @ApiProperty()
  position: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  color?: string | null;

  @ApiPropertyOptional()
  icon?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Número de subdepartamentos' })
  _count?: {
    children?: number;
    users?: number;
  };
}

