import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const modelNames = [
      'notification',
      'salesActivity',
      'salesComment',
      'salesOpportunity',
      'salesStage',
      'salesPipeline',
      'cardActivity',
      'cardAttachment',
      'cardComment',
      'kanbanCard',
      'kanbanColumn',
      'kanbanBoard',
      'whatsAppMessage',
      'whatsAppConversation',
      'message',
      'chatParticipant',
      'chat',
      'user',
      'permission',
      'role',
      'department',
    ];

    for (const modelName of modelNames) {
      const model = this[modelName as keyof this];
      if (model && typeof model === 'object' && 'deleteMany' in model) {
        await (model as { deleteMany: () => Promise<unknown> }).deleteMany();
      }
    }
  }
}

