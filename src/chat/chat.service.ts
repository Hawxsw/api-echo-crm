import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateChatDto, SendMessageDto, UpdateMessageDto } from './dto/chat.dto';
import {
  getChatWithParticipantsInclude,
  getMessageWithSenderInclude,
  USER_WITH_ROLE_SELECT,
} from './constants/chat-selectors.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createChat(createChatDto: CreateChatDto, creatorId: string) {
    await this.ensureUserExists(creatorId);
    await this.ensureAllParticipantsExist(createChatDto.participantIds);

    const allParticipantIds = [creatorId, ...createChatDto.participantIds];

    if (this.isDirectChat(createChatDto, allParticipantIds)) {
      const existingChat = await this.findExistingDirectChat(allParticipantIds);
      if (existingChat) return existingChat;
    }

    return this.createNewChat(createChatDto, allParticipantIds);
  }

  private isDirectChat(dto: CreateChatDto, participantIds: string[]): boolean {
    return !dto.isGroup && participantIds.length === 2;
  }

  private async findExistingDirectChat(participantIds: string[]) {
    return this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: { userId: { in: participantIds } },
        },
      },
      include: getChatWithParticipantsInclude(),
    });
  }

  private async createNewChat(dto: CreateChatDto, participantIds: string[]) {
    return this.prisma.chat.create({
      data: {
        name: dto.name,
        isGroup: dto.isGroup,
        participants: {
          create: participantIds.map(userId => ({ userId })),
        },
      },
      include: getChatWithParticipantsInclude(),
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  private async ensureAllParticipantsExist(participantIds: string[]): Promise<void> {
    const participants = await this.prisma.user.findMany({
      where: { id: { in: participantIds } },
    });

    if (participants.length !== participantIds.length) {
      throw new ForbiddenException('Alguns participantes não foram encontrados');
    }
  }

  async findAllChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        ...getChatWithParticipantsInclude(),
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: getMessageWithSenderInclude(),
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneChat(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: { select: USER_WITH_ROLE_SELECT },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: getMessageWithSenderInclude(),
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat não encontrado');
    }

    return chat;
  }

  async sendMessage(sendMessageDto: SendMessageDto, senderId: string) {
    await this.ensureUserIsParticipant(sendMessageDto.chatId, senderId);

    const message = await this.createMessage(sendMessageDto, senderId);
    await Promise.all([
      this.updateChatTimestamp(sendMessageDto.chatId),
      this.notifyParticipants(sendMessageDto.chatId, senderId, message),
    ]);

    return message;
  }

  private async createMessage(dto: SendMessageDto, senderId: string) {
    return this.prisma.message.create({
      data: {
        content: dto.content,
        chatId: dto.chatId,
        senderId,
      },
      include: getMessageWithSenderInclude(),
    });
  }

  private async ensureUserIsParticipant(chatId: string, userId: string): Promise<void> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: { some: { userId } },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat não encontrado ou você não é participante');
    }
  }

  private async updateChatTimestamp(chatId: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  }

  private async notifyParticipants(chatId: string, senderId: string, message: any): Promise<void> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: { include: { user: true } },
      },
    });

    if (!chat) return;

    const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
    const otherParticipants = chat.participants
      .filter(p => p.userId !== senderId)
      .map(p => p.userId);

    await Promise.all(
      otherParticipants.map(async (participantId) => {
        const notification = await this.notificationsService.createMessageNotification(
          participantId,
          senderName,
          chatId,
          message.content,
        );
        this.notificationsGateway.sendNotificationToUser(participantId, notification);
      })
    );
  }

  async getChatMessages(chatId: string, userId: string, page = 1, limit = 50) {
    await this.ensureUserIsParticipant(chatId, userId);

    const skip = (page - 1) * limit;
    const where = { chatId, isDeleted: false };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: getMessageWithSenderInclude(),
      }),
      this.prisma.message.count({ where }),
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

  async updateMessage(messageId: string, updateMessageDto: UpdateMessageDto, userId: string) {
    await this.ensureMessageBelongsToUser(messageId, userId);

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        isEdited: true,
      },
      include: getMessageWithSenderInclude(),
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    await this.ensureUserOwnsMessage(messageId, userId);

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { message: 'Mensagem deletada com sucesso' };
  }

  async markAsRead(chatId: string, userId: string) {
    const participant = await this.findChatParticipant(chatId, userId);

    await this.prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return { message: 'Chat marcado como lido' };
  }

  private async ensureMessageBelongsToUser(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }
  }

  private async ensureUserOwnsMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }
  }

  private async findChatParticipant(chatId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { chatId, userId },
    });

    if (!participant) {
      throw new NotFoundException('Você não é participante deste chat');
    }

    return participant;
  }

  async cleanupDuplicateChats(userId: string) {
    const userChats = await this.findUserDirectChats(userId);
    const chatGroups = this.groupChatsByParticipants(userChats);
    const deletedChats = await this.removeDuplicateChats(chatGroups);

    return {
      success: true,
      message: `${deletedChats.length} chats duplicados removidos`,
      deletedChats,
      remainingChats: userChats.length - deletedChats.length,
    };
  }

  private async findUserDirectChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        isGroup: false,
        participants: { some: { userId } },
      },
      include: { participants: true },
    });
  }

  private groupChatsByParticipants(chats: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    
    chats
      .filter(chat => chat.participants.length === 2)
      .forEach(chat => {
        const key = this.createParticipantsKey(chat.participants);
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, chat]);
      });

    return groups;
  }

  private createParticipantsKey(participants: any[]): string {
    return participants
      .map(p => p.userId)
      .sort()
      .join('-');
  }

  private async removeDuplicateChats(chatGroups: Map<string, any[]>): Promise<string[]> {
    const deletedChats: string[] = [];

    for (const chats of chatGroups.values()) {
      if (chats.length > 1) {
        const sorted = this.sortChatsByCreationDate(chats);
        const toDelete = sorted.slice(1);
        
        for (const chat of toDelete) {
          await this.deleteChat(chat.id);
          deletedChats.push(chat.id);
        }
      }
    }

    return deletedChats;
  }

  private sortChatsByCreationDate(chats: any[]) {
    return [...chats].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private async deleteChat(chatId: string): Promise<void> {
    await this.prisma.message.deleteMany({ where: { chatId } });
    await this.prisma.chatParticipant.deleteMany({ where: { chatId } });
    await this.prisma.chat.delete({ where: { id: chatId } });
  }
}


