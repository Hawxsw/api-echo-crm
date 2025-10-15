import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto, FeedbackResponseDto, FeedbackStatsDto } from './dto/feedback.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully', type: FeedbackResponseDto })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.create(createFeedbackDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all feedbacks' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Feedbacks list retrieved successfully' })
  async findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.findAll(pagination.page, pagination.limit, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'List my feedbacks' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'My feedbacks list retrieved successfully' })
  async findMyFeedbacks(
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.findMyFeedbacks(userId, pagination.page, pagination.limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get feedback statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: FeedbackStatsDto })
  async getStats() {
    return this.feedbackService.getStats();
  }

  @Get('top-suggestions')
  @ApiOperation({ summary: 'Get top voted suggestions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top suggestions retrieved successfully' })
  async getTopSuggestions(@Query('limit') limit?: string) {
    return this.feedbackService.getTopSuggestions(limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback found', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove feedback' })
  @ApiResponse({ status: 204, description: 'Feedback removed successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.feedbackService.remove(id, userId);
  }

  @Post(':id/vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle vote on feedback' })
  @ApiResponse({ status: 200, description: 'Vote toggled successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async toggleVote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.feedbackService.toggleVote(id, userId);
  }
}

