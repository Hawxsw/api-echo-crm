import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, MarkAsReadDto, MarkAllAsReadDto } from './dto/notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'Returns all notifications' })
  findAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications for current user' })
  @ApiResponse({ status: 200, description: 'Returns unread notifications' })
  findUnread(@CurrentUser('id') userId: string) {
    return this.notificationsService.findUnread(userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Returns unread count' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(markAsReadDto);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead({ userId });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  @ApiResponse({ status: 200, description: 'All notifications deleted' })
  deleteAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.deleteAll(userId);
  }
}

