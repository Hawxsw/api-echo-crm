import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  CreateConversationDto,
  SendWhatsAppMessageDto,
  UpdateConversationDto,
} from './dto/whatsapp.dto';

@Injectable()
export class WhatsappService {
  private autoResponses = [
    'Olá! Obrigado por entrar em contato. Como posso ajudá-lo?',
    'Entendi sua solicitação. Vou verificar isso para você.',
    'Agradecemos seu interesse! Nossa equipe retornará em breve.',
    'Recebi sua mensagem! Estou processando sua solicitação.',
    'Obrigado pela informação. Vou analisar e retornar o mais breve possível.',
  ];

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto) {
    const conversation = await this.prisma.whatsAppConversation.create({
      data: {
        clientName: createConversationDto.clientName,
        clientPhone: createConversationDto.clientPhone,
        assignedToId: createConversationDto.assignedToId,
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
      },
    });

    await this.sendAutoResponse(conversation.id);

    return conversation;
  }

  async findAllConversations(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.whatsAppConversation.findMany({
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.whatsAppConversation.count(),
    ]);

    return {
      data: conversations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneConversation(id: string) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id },
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
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return conversation;
  }

  async updateConversation(id: string, updateConversationDto: UpdateConversationDto) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return this.prisma.whatsAppConversation.update({
      where: { id },
      data: updateConversationDto,
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
  }

  async sendMessage(sendMessageDto: SendWhatsAppMessageDto) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id: sendMessageDto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const message = await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: sendMessageDto.conversationId,
        content: sendMessageDto.content,
        isFromClient: sendMessageDto.isFromClient,
        status: 'DELIVERED',
      },
    });

    await this.prisma.whatsAppConversation.update({
      where: { id: sendMessageDto.conversationId },
      data: { lastMessageAt: new Date() },
    });

    if (sendMessageDto.isFromClient) {
      setTimeout(() => {
        this.sendAutoResponse(sendMessageDto.conversationId);
      }, 2000);

      if (conversation.assignedToId) {
        const notification = await this.notificationsService.createWhatsAppNotification(
          conversation.assignedToId,
          conversation.clientName,
          conversation.id,
          sendMessageDto.content,
        );
        this.notificationsGateway.sendNotificationToUser(conversation.assignedToId, notification);
      }
    }

    return message;
  }

  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.whatsAppMessage.count({
        where: { conversationId },
      }),
    ]);

    return {
      data: messages.reverse(),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async sendAutoResponse(conversationId: string) {
    const randomResponse = this.autoResponses[
      Math.floor(Math.random() * this.autoResponses.length)
    ];

    await this.prisma.whatsAppMessage.create({
      data: {
        conversationId,
        content: randomResponse || 'Obrigado pela mensagem!',
        isFromClient: false,
        status: 'DELIVERED',
      },
    });

    await this.prisma.whatsAppConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  }

  async deleteConversation(id: string) {
    const conversation = await this.prisma.whatsAppConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    await this.prisma.whatsAppConversation.delete({ where: { id } });

    return { message: 'Conversa deletada com sucesso' };
  }
}

