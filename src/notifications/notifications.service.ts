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
      this.logger.error(`Error creating notification: ${error.message}`);
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

  // Helper methods for creating specific notification types
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

  async createMessageNotification(userId: string, senderName: string, chatId: string) {
    return this.create({
      type: NotificationType.MESSAGE,
      title: 'Nova mensagem',
      message: `${senderName} enviou uma mensagem`,
      userId,
      metadata: { chatId },
      actionUrl: `/dashboard/chats`,
    });
  }

  async createWhatsAppNotification(userId: string, clientName: string, conversationId: string) {
    return this.create({
      type: NotificationType.WHATSAPP_MESSAGE,
      title: 'Nova mensagem WhatsApp',
      message: `${clientName} enviou uma mensagem`,
      userId,
      metadata: { conversationId },
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

