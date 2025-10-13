import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [KanbanController],
  providers: [KanbanService],
  exports: [KanbanService],
})
export class KanbanModule {}

