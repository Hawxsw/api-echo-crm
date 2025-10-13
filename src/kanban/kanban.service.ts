import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
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

@Injectable()
export class KanbanService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto) {
    return this.prisma.kanbanBoard.create({
      data: {
        ...createBoardDto,
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAllBoards() {
    return this.prisma.kanbanBoard.findMany({
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { cards: true },
            },
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBoard(id: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                createdBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    return board;
  }

  async updateBoard(id: string, updateBoardDto: UpdateBoardDto) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    return this.prisma.kanbanBoard.update({
      where: { id },
      data: updateBoardDto,
    });
  }

  async removeBoard(id: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    await this.prisma.kanbanBoard.delete({ where: { id } });

    return { message: 'Board removido com sucesso' };
  }

  async createColumn(boardId: string, createColumnDto: CreateColumnDto) {
    await this.ensureBoardExists(boardId);

    await this.prisma.kanbanColumn.updateMany({
      where: {
        boardId,
        position: { gte: createColumnDto.position },
      },
      data: {
        position: { increment: 1 },
      },
    });

    return this.prisma.kanbanColumn.create({
      data: {
        ...createColumnDto,
        boardId,
      },
    });
  }

  private async ensureBoardExists(boardId: string): Promise<void> {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }
  }

  async updateColumn(columnId: string, updateColumnDto: UpdateColumnDto) {
    await this.ensureColumnExists(columnId);

    return this.prisma.kanbanColumn.update({
      where: { id: columnId },
      data: updateColumnDto,
    });
  }

  private async ensureColumnExists(columnId: string) {
    const column = await this.prisma.kanbanColumn.findFirst({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    return column;
  }

  async moveColumn(columnId: string, moveColumnDto: MoveColumnDto) {
    const column = await this.ensureColumnExists(columnId);

    const oldPosition = column.position;
    const newPosition = moveColumnDto.newPosition;

    if (oldPosition === newPosition) {
      return column;
    }

    if (oldPosition < newPosition) {
      await this.prisma.kanbanColumn.updateMany({
        where: {
          boardId: column.boardId,
          position: { gt: oldPosition, lte: newPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    } else {
      await this.prisma.kanbanColumn.updateMany({
        where: {
          boardId: column.boardId,
          position: { gte: newPosition, lt: oldPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }

    return this.prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { position: newPosition },
    });
  }

  async removeColumn(columnId: string) {
    const column = await this.ensureColumnExists(columnId);

    await this.prisma.kanbanColumn.delete({ where: { id: columnId } });

    await this.prisma.kanbanColumn.updateMany({
      where: {
        boardId: column.boardId,
        position: { gt: column.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return { message: 'Coluna removida com sucesso' };
  }

  async createCard(columnId: string, createCardDto: CreateCardDto, createdById: string) {
    const column = await this.ensureColumnExists(columnId);

    await this.prisma.kanbanCard.updateMany({
      where: {
        columnId,
        position: { gte: createCardDto.position },
      },
      data: {
        position: { increment: 1 },
      },
    });

    const card = await this.prisma.kanbanCard.create({
      data: {
        ...createCardDto,
        columnId,
        createdById,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await this.createCardActivity(card.id, createdById, 'created', `Card "${card.title}" foi criado`);

    if (card.assignedToId && card.assignedToId !== createdById) {
      await this.notifyAssignedUser(card.assignedToId, card.title, card.id, column.boardId);
    }

    return card;
  }

  private async createCardActivity(cardId: string, userId: string, action: string, description: string): Promise<void> {
    await this.prisma.cardActivity.create({
      data: {
        cardId,
        userId,
        action,
        description,
      },
    });
  }

  private async notifyAssignedUser(userId: string, cardTitle: string, cardId: string, boardId: string): Promise<void> {
    const notification = await this.notificationsService.createTaskAssignedNotification(
      userId,
      cardTitle,
      cardId,
      boardId,
    );
    this.notificationsGateway.sendNotificationToUser(userId, notification);
  }

  async findOneCard(cardId: string) {
    const card = await this.prisma.kanbanCard.findUnique({
      where: {
        id: cardId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    return card;
  }

  async updateCard(cardId: string, updateCardDto: UpdateCardDto, userId: string) {
    const card = await this.prisma.kanbanCard.findUnique({
      where: {
        id: cardId,
      },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    const updatedCard = await this.prisma.kanbanCard.update({
      where: { id: cardId },
      data: updateCardDto,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (updateCardDto.assignedToId && updateCardDto.assignedToId !== card.assignedToId) {
      await this.createCardActivity(cardId, userId, 'assigned', 'Card foi atribuído');

      if (updateCardDto.assignedToId !== userId) {
        await this.notifyAssignedUser(updateCardDto.assignedToId, updatedCard.title, cardId, card.column.boardId);
      }
    }

    return updatedCard;
  }

  async moveCard(cardId: string, moveCardDto: MoveCardDto, userId: string) {
    const card = await this.prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
      },
      include: {
        column: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    const targetColumn = await this.prisma.kanbanColumn.findFirst({
      where: {
        id: moveCardDto.targetColumnId,
      },
    });

    if (!targetColumn) {
      throw new NotFoundException('Coluna de destino não encontrada');
    }

    const oldColumnId = card.columnId;
    const newColumnId = moveCardDto.targetColumnId;
    const oldPosition = card.position;
    const newPosition = moveCardDto.newPosition;

    if (oldColumnId === newColumnId) {
      if (oldPosition === newPosition) return card;

      if (oldPosition < newPosition) {
        await this.prisma.kanbanCard.updateMany({
          where: {
            columnId: oldColumnId,
            position: { gt: oldPosition, lte: newPosition },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      } else {
        await this.prisma.kanbanCard.updateMany({
          where: {
            columnId: oldColumnId,
            position: { gte: newPosition, lt: oldPosition },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }
    } else {
      await this.prisma.kanbanCard.updateMany({
        where: {
          columnId: oldColumnId,
          position: { gt: oldPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      await this.prisma.kanbanCard.updateMany({
        where: {
          columnId: newColumnId,
          position: { gte: newPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }

    const movedCard = await this.prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        columnId: newColumnId,
        position: newPosition,
      },
    });

    await this.createCardActivity(cardId, userId, 'moved', `Card movido de "${card.column.name}" para "${targetColumn.name}"`);

    return movedCard;
  }

  async removeCard(cardId: string) {
    const card = await this.prisma.kanbanCard.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    await this.prisma.kanbanCard.delete({ where: { id: cardId } });

    await this.prisma.kanbanCard.updateMany({
      where: {
        columnId: card.columnId,
        position: { gt: card.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return { message: 'Card removido com sucesso' };
  }

  async createComment(cardId: string, createCommentDto: CreateCommentDto, userId: string) {
    const card = await this.prisma.kanbanCard.findUnique({
      where: {
        id: cardId,
      },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    const comment = await this.prisma.cardComment.create({
      data: {
        ...createCommentDto,
        cardId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await this.createCardActivity(cardId, userId, 'commented', 'Comentário adicionado');

    const commenterName = `${comment.user.firstName} ${comment.user.lastName}`;
    await this.notifyCommentRecipients(card, userId, cardId, commenterName);

    return comment;
  }

  private async notifyCommentRecipients(card: any, userId: string, cardId: string, commenterName: string): Promise<void> {
    const usersToNotify = new Set<string>();
    
    if (card.createdById !== userId) {
      usersToNotify.add(card.createdById);
    }
    if (card.assignedToId && card.assignedToId !== userId) {
      usersToNotify.add(card.assignedToId);
    }

    await Promise.all(
      Array.from(usersToNotify).map(async (notifyUserId) => {
        const notification = await this.notificationsService.createTaskCommentNotification(
          notifyUserId,
          card.title,
          cardId,
          commenterName,
          card.column.boardId,
        );
        this.notificationsGateway.sendNotificationToUser(notifyUserId, notification);
      })
    );
  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.cardComment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return this.prisma.cardComment.update({
      where: { id: commentId },
      data: updateCommentDto,
    });
  }

  async removeComment(commentId: string, userId: string) {
    const comment = await this.prisma.cardComment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    await this.prisma.cardComment.delete({ where: { id: commentId } });

    return { message: 'Comentário removido com sucesso' };
  }
}

