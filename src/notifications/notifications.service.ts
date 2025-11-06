import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, MarkAsReadDto, MarkAllAsReadDto } from './dto/notification.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: createNotificationDto,
      });

      this.logger.log(`Notification created: ${notification.id} for user ${createNotificationDto.userId}`);
      return notification;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating notification: ${message}`);
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(markAsReadDto: MarkAsReadDto) {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: markAsReadDto.notificationIds },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, count: markAsReadDto.notificationIds.length };
  }

  async markAllAsRead(markAllAsReadDto: MarkAllAsReadDto) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId: markAllAsReadDto.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, count: result.count };
  }

  async delete(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  async deleteAll(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { success: true, count: result.count };
  }

  async createTaskAssignedNotification(userId: string, cardTitle: string, cardId: string, boardId: string) {
    return this.create({
      type: NotificationType.TASK_ASSIGNED,
      title: 'Nova tarefa atribuída',
      message: `Você foi atribuído à tarefa "${cardTitle}"`,
      userId,
      metadata: { cardId, boardId },
      actionUrl: `/dashboard/kanban/${boardId}`,
    });
  }

  async createTaskCommentNotification(userId: string, cardTitle: string, cardId: string, commenterName: string, boardId: string) {
    return this.create({
      type: NotificationType.TASK_COMMENT,
      title: 'Novo comentário',
      message: `${commenterName} comentou em "${cardTitle}"`,
      userId,
      metadata: { cardId, boardId },
      actionUrl: `/dashboard/kanban/${boardId}`,
    });
  }

  async createMessageNotification(userId: string, senderName: string, chatId: string, messageText?: string) {
    return this.create({
      type: NotificationType.MESSAGE,
      title: `${senderName} enviou uma nova mensagem`,
      message: messageText ?? `${senderName} enviou uma mensagem`,
      userId,
      metadata: { chatId, messageText },
      actionUrl: `/dashboard/chats`,
    });
  }

  async createWhatsAppNotification(userId: string, clientName: string, conversationId: string, messageText?: string) {
    return this.create({
      type: NotificationType.WHATSAPP_MESSAGE,
      title: `${clientName} enviou uma nova mensagem`,
      message: messageText ?? `${clientName} enviou uma mensagem`,
      userId,
      metadata: { conversationId, messageText },
      actionUrl: `/dashboard/whatsapp/${conversationId}`,
    });
  }

  async createSalesAssignedNotification(userId: string, opportunityTitle: string, opportunityId: string) {
    return this.create({
      type: NotificationType.SALES_ASSIGNED,
      title: 'Nova oportunidade atribuída',
      message: `Você foi atribuído à oportunidade "${opportunityTitle}"`,
      userId,
      metadata: { opportunityId },
      actionUrl: `/dashboard/kanban/sales`,
    });
  }

  async createMentionNotification(userId: string, mentionerName: string, context: string, actionUrl: string) {
    return this.create({
      type: NotificationType.MENTION,
      title: 'Você foi mencionado',
      message: `${mentionerName} mencionou você em ${context}`,
      userId,
      actionUrl,
    });
  }
}

