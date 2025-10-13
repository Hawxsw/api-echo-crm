import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
import {
  SalesOpportunityPriority,
  SalesActivityType,
  SalesActivityStatus,
} from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // ============ PIPELINE METHODS ============

  async createPipeline(createPipelineDto: CreatePipelineDto) {
    try {
      return await this.prisma.salesPipeline.create({
        data: createPipelineDto,
        include: {
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao criar pipeline: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllPipelines() {
    try {
      return await this.prisma.salesPipeline.findMany({
        where: { isActive: true },
        include: {
          stages: {
            orderBy: { position: 'asc' },
            include: {
              opportunities: {
                include: {
                  createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                  },
                  assignedTo: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar pipelines: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOnePipeline(id: string) {
    try {
      const pipeline = await this.prisma.salesPipeline.findUnique({
        where: { id },
        include: {
          stages: {
            orderBy: { position: 'asc' },
            include: {
              opportunities: {
                include: {
                  createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                  },
                  assignedTo: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!pipeline) {
        throw new NotFoundException('Pipeline não encontrado');
      }

      return pipeline;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao buscar pipeline: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updatePipeline(id: string, updatePipelineDto: UpdatePipelineDto) {
    try {
      const pipeline = await this.findOnePipeline(id);
      
      return await this.prisma.salesPipeline.update({
        where: { id },
        data: updatePipelineDto,
        include: {
          stages: {
            orderBy: { position: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao atualizar pipeline: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removePipeline(id: string) {
    try {
      const pipeline = await this.findOnePipeline(id);
      
      return await this.prisma.salesPipeline.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao remover pipeline: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ============ STAGE METHODS ============

  async createStage(pipelineId: string, createStageDto: CreateStageDto) {
    try {
      const pipeline = await this.findOnePipeline(pipelineId);
      
      // Verificar se a posição já existe
      const existingStage = await this.prisma.salesStage.findFirst({
        where: {
          pipelineId,
          position: createStageDto.position,
        },
      });

      if (existingStage) {
        // Mover estágios existentes
        await this.prisma.salesStage.updateMany({
          where: {
            pipelineId,
            position: { gte: createStageDto.position },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }

      return await this.prisma.salesStage.create({
        data: {
          ...createStageDto,
          pipelineId,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao criar estágio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStage(id: string, updateStageDto: UpdateStageDto) {
    const stage = await this.prisma.salesStage.findUnique({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    // Se a posição foi alterada, reorganizar
    if (updateStageDto.position !== undefined && updateStageDto.position !== stage.position) {
      await this.moveStagePositions(stage.pipelineId, stage.position, updateStageDto.position);
    }

    return this.prisma.salesStage.update({
      where: { id },
      data: updateStageDto,
    });
  }

  async moveStage(id: string, moveStageDto: MoveStageDto) {
    const stage = await this.prisma.salesStage.findUnique({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    await this.moveStagePositions(stage.pipelineId, stage.position, moveStageDto.newPosition);

    return this.prisma.salesStage.update({
      where: { id },
      data: { position: moveStageDto.newPosition },
    });
  }

  private async moveStagePositions(pipelineId: string, oldPosition: number, newPosition: number) {
    if (oldPosition < newPosition) {
      // Movendo para direita - diminuir posições dos estágios no meio
      await this.prisma.salesStage.updateMany({
        where: {
          pipelineId,
          position: { gt: oldPosition, lte: newPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    } else {
      // Movendo para esquerda - aumentar posições dos estágios no meio
      await this.prisma.salesStage.updateMany({
        where: {
          pipelineId,
          position: { gte: newPosition, lt: oldPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }
  }

  async removeStage(id: string) {
    const stage = await this.prisma.salesStage.findUnique({
      where: { id },
      include: {
        opportunities: true,
      },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    if (stage.opportunities.length > 0) {
      throw new BadRequestException('Não é possível excluir estágio com oportunidades');
    }

    // Ajustar posições dos estágios restantes
    await this.prisma.salesStage.updateMany({
      where: {
        pipelineId: stage.pipelineId,
        position: { gt: stage.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return this.prisma.salesStage.delete({
      where: { id },
    });
  }

  // ============ OPPORTUNITY METHODS ============

  async createOpportunity(createOpportunityDto: CreateOpportunityDto, userId: string) {
    try {
      const stage = await this.prisma.salesStage.findUnique({
        where: { id: createOpportunityDto.stageId },
      });

      if (!stage) {
        throw new NotFoundException('Estágio não encontrado');
      }

      return await this.prisma.salesOpportunity.create({
        data: {
          ...createOpportunityDto,
          createdById: userId,
        },
        include: {
          stage: true,
          createdBy: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao criar oportunidade: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneOpportunity(id: string) {
    try {
      const opportunity = await this.prisma.salesOpportunity.findUnique({
        where: { id },
        include: {
          stage: true,
          createdBy: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          comments: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
            orderBy: [
              { isPinned: 'desc' },
              { createdAt: 'desc' },
            ],
          },
          activities: {
            include: {
              assignedTo: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
            orderBy: { scheduledDate: 'asc' },
          },
        },
      });

      if (!opportunity) {
        throw new NotFoundException('Oportunidade não encontrada');
      }

      return opportunity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao buscar oportunidade: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOpportunity(id: string, updateOpportunityDto: UpdateOpportunityDto, userId: string) {
    const opportunity = await this.findOneOpportunity(id);

    return this.prisma.salesOpportunity.update({
      where: { id },
      data: updateOpportunityDto,
      include: {
        stage: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async moveOpportunity(id: string, moveOpportunityDto: MoveOpportunityDto, userId: string) {
    const opportunity = await this.findOneOpportunity(id);
    
    const stage = await this.prisma.salesStage.findUnique({
      where: { id: moveOpportunityDto.stageId },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    return this.prisma.salesOpportunity.update({
      where: { id },
      data: {
        stageId: moveOpportunityDto.stageId,
      },
      include: {
        stage: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async removeOpportunity(id: string) {
    const opportunity = await this.findOneOpportunity(id);
    
    return this.prisma.salesOpportunity.delete({
      where: { id },
    });
  }

  // ============ COMMENT METHODS ============

  async createComment(opportunityId: string, createCommentDto: CreateCommentDto, userId: string) {
    const opportunity = await this.findOneOpportunity(opportunityId);

    return this.prisma.salesComment.create({
      data: {
        ...createCommentDto,
        opportunityId,
        userId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async updateComment(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.salesComment.findFirst({
      where: { id, userId },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return this.prisma.salesComment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async removeComment(id: string, userId: string) {
    const comment = await this.prisma.salesComment.findFirst({
      where: { id, userId },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return this.prisma.salesComment.delete({
      where: { id },
    });
  }

  // ============ ACTIVITY METHODS ============

  async createActivity(opportunityId: string, createActivityDto: CreateActivityDto, userId: string) {
    const opportunity = await this.findOneOpportunity(opportunityId);

    return this.prisma.salesActivity.create({
      data: {
        ...createActivityDto,
        opportunityId,
        assignedToId: userId, // Por enquanto, o criador é o responsável
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async updateActivity(id: string, updateActivityDto: UpdateActivityDto, userId: string) {
    const activity = await this.prisma.salesActivity.findFirst({
      where: { id, assignedToId: userId },
    });

    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }

    return this.prisma.salesActivity.update({
      where: { id },
      data: updateActivityDto,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async completeActivity(id: string, userId: string) {
    const activity = await this.prisma.salesActivity.findFirst({
      where: { id, assignedToId: userId },
    });

    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }

    const now = new Date();
    const completedTime = now.toTimeString().slice(0, 5);

    return this.prisma.salesActivity.update({
      where: { id },
      data: {
        status: SalesActivityStatus.COMPLETED,
        completedDate: now,
        completedTime,
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async removeActivity(id: string, userId: string) {
    const activity = await this.prisma.salesActivity.findFirst({
      where: { id, assignedToId: userId },
    });

    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }

    return this.prisma.salesActivity.delete({
      where: { id },
    });
  }
}
