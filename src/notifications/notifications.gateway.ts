import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      this.userSockets.set(userId, client.id);
      this.logger.log(`User ${userId} connected to notifications with socket ${client.id}`);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries())
      .find(([, socketId]) => socketId === client.id)?.[0];
    
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(client: Socket, userId: string) {
    client.join(`user:${userId}`);
    this.userSockets.set(userId, client.id);
    this.logger.log(`User ${userId} joined notifications room`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('newNotification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  sendNotificationCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('notificationCount', { count });
  }

  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }
}

