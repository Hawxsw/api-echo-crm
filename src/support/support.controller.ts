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
import { SupportService } from './support.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketResponseDto,
  CreateFAQDto,
  UpdateFAQDto,
  FAQResponseDto,
} from './dto/support.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully', type: TicketResponseDto })
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.createTicket(createTicketDto, userId);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List my support tickets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tickets list retrieved successfully' })
  async findAllTickets(
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.findAllTickets(pagination.page, pagination.limit, userId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Find ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket found', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOneTicket(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.findOneTicket(id, userId);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.updateTicket(id, updateTicketDto, userId);
  }

  @Delete('tickets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove ticket' })
  @ApiResponse({ status: 204, description: 'Ticket removed successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeTicket(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.supportService.removeTicket(id, userId);
  }

  @Post('faqs')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Create new FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully', type: FAQResponseDto })
  async createFAQ(@Body() createFAQDto: CreateFAQDto) {
    return this.supportService.createFAQ(createFAQDto);
  }

  @Get('faqs')
  @ApiOperation({ summary: 'List all FAQs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'FAQs list retrieved successfully' })
  async findAllFAQs(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.supportService.findAllFAQs(pagination.page, pagination.limit, category, search);
  }

  @Get('faqs/categories')
  @ApiOperation({ summary: 'Get all FAQ categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getFAQCategories() {
    return this.supportService.getFAQCategories();
  }

  @Get('faqs/:id')
  @ApiOperation({ summary: 'Find FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ found', type: FAQResponseDto })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async findOneFAQ(@Param('id') id: string) {
    return this.supportService.findOneFAQ(id);
  }

  @Patch('faqs/:id')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Update FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully', type: FAQResponseDto })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async updateFAQ(
    @Param('id') id: string,
    @Body() updateFAQDto: UpdateFAQDto,
  ) {
    return this.supportService.updateFAQ(id, updateFAQDto);
  }

  @Delete('faqs/:id')
  @Roles('Super Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove FAQ' })
  @ApiResponse({ status: 204, description: 'FAQ removed successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async removeFAQ(@Param('id') id: string): Promise<void> {
    await this.supportService.removeFAQ(id);
  }
}

