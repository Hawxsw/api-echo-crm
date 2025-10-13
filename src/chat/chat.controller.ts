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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateChatDto, SendMessageDto, UpdateMessageDto, MarkAsReadDto } from './dto/chat.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo chat' })
  @ApiResponse({ status: 201, description: 'Chat criado com sucesso' })
  create(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.createChat(createChatDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os chats do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de chats retornada com sucesso' })
  findAll(
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.findAllChats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar chat por ID' })
  @ApiResponse({ status: 200, description: 'Chat encontrado' })
  @ApiResponse({ status: 404, description: 'Chat não encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.findOneChat(id, userId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    const message = await this.chatService.sendMessage(sendMessageDto, userId);
    
    this.emitMessageToChat(sendMessageDto.chatId, message);
    
    return message;
  }

  private emitMessageToChat(chatId: string, message: any): void {
    this.chatGateway.server
      .to(`chat:${chatId}`)
      .emit('newMessage', { message });
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Buscar mensagens do chat' })
  @ApiResponse({ status: 200, description: 'Mensagens retornadas com sucesso' })
  getChatMessages(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatService.getChatMessages(chatId, userId, pagination.page, pagination.limit);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Editar mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem editada com sucesso' })
  updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.updateMessage(id, updateMessageDto, userId);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Deletar mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem deletada com sucesso' })
  deleteMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.deleteMessage(id, userId);
  }

  @Post(':chatId/mark-as-read')
  @ApiOperation({ summary: 'Marcar chat como lido' })
  @ApiResponse({ status: 200, description: 'Chat marcado como lido' })
  markAsRead(
    @Param('chatId') chatId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(chatId, userId);
  }

  @Post('cleanup-duplicates')
  @ApiOperation({ summary: 'Limpar chats duplicados' })
  @ApiResponse({ status: 200, description: 'Chats duplicados removidos com sucesso' })
  cleanupDuplicateChats(@CurrentUser('id') userId: string) {
    return this.chatService.cleanupDuplicateChats(userId);
  }
}

