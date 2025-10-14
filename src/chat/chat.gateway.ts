import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

interface SocketData {
  chatId: string;
  userId: string;
}

interface MessageData {
  message: SendMessageDto;
  userId: string;
}

interface TypingData {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, string>();

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket): Promise<void> {
    const userId = this.extractUserId(client);
    
    if (!userId) {
      this.logger.warn('Connection attempt without userId');
      return;
    }

    this.userSockets.set(userId, client.id);
    await this.joinUserChats(client, userId);
  }

  handleDisconnect(client: Socket): void {
    const userId = this.findUserBySocketId(client.id);
    
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  private extractUserId(client: Socket): string | null {
    return (client.handshake.query.userId as string) || null;
  }

  private findUserBySocketId(socketId: string): string | null {
    return Array.from(this.userSockets.entries())
      .find(([_, sid]) => sid === socketId)?.[0] || null;
  }

  private async joinUserChats(client: Socket, userId: string): Promise<void> {
    try {
      const userChats = await this.chatService.findAllChats(userId);
      userChats.forEach(chat => client.join(`chat:${chat.id}`));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to join user chats: ${message}`);
    }
  }

  private createChatRoom(chatId: string): string {
    return `chat:${chatId}`;
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: SocketData,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.createChatRoom(data.chatId);
    client.join(room);
    return { event: 'joinedChat', data: { chatId: data.chatId } };
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @MessageBody() data: SocketData,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.createChatRoom(data.chatId);
    client.leave(room);
    return { event: 'leftChat', data: { chatId: data.chatId } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: MessageData) {
    try {
      const message = await this.chatService.sendMessage(data.message, data.userId);
      const room = this.createChatRoom(data.message.chatId);

      this.server.to(room).emit('newMessage', { message });

      return { event: 'messageSent', data: message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { event: 'error', data: { message: errorMessage } };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: TypingData,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.createChatRoom(data.chatId);
    client.to(room).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@MessageBody() data: SocketData) {
    try {
      await this.chatService.markAsRead(data.chatId, data.userId);
      const room = this.createChatRoom(data.chatId);
      
      this.server.to(room).emit('messageRead', {
        chatId: data.chatId,
        userId: data.userId,
      });

      return { event: 'markedAsRead', data: { chatId: data.chatId } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { event: 'error', data: { message: errorMessage } };
    }
  }
}

