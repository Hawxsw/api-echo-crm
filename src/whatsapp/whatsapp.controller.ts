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
import { WhatsappService } from './whatsapp.service';
import {
  CreateConversationDto,
  SendWhatsAppMessageDto,
  UpdateConversationDto,
} from './dto/whatsapp.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('whatsapp')
@ApiBearerAuth()
@Controller('whatsapp')
@UseGuards(RolesGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Criar nova conversa do WhatsApp' })
  @ApiResponse({ status: 201, description: 'Conversa criada com sucesso' })
  createConversation(
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.whatsappService.createConversation(createConversationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar todas as conversas do WhatsApp' })
  @ApiResponse({ status: 200, description: 'Lista de conversas retornada com sucesso' })
  findAllConversations(
    @Query() pagination: PaginationDto,
  ) {
    return this.whatsappService.findAllConversations(pagination.page, pagination.limit);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Buscar conversa por ID' })
  @ApiResponse({ status: 200, description: 'Conversa encontrada' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  findOneConversation(@Param('id') id: string) {
    return this.whatsappService.findOneConversation(id);
  }

  @Patch('conversations/:id')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Atualizar conversa' })
  @ApiResponse({ status: 200, description: 'Conversa atualizada com sucesso' })
  updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.whatsappService.updateConversation(id, updateConversationDto);
  }

  @Delete('conversations/:id')
  @Roles('Super Admin', 'Gerente')
  @ApiOperation({ summary: 'Deletar conversa' })
  @ApiResponse({ status: 200, description: 'Conversa deletada com sucesso' })
  deleteConversation(@Param('id') id: string) {
    return this.whatsappService.deleteConversation(id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensagem do WhatsApp' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  sendMessage(@Body() sendMessageDto: SendWhatsAppMessageDto) {
    return this.whatsappService.sendMessage(sendMessageDto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Buscar mensagens da conversa' })
  @ApiResponse({ status: 200, description: 'Mensagens retornadas com sucesso' })
  getConversationMessages(
    @Param('id') conversationId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.whatsappService.getConversationMessages(
      conversationId,
      pagination.page,
      pagination.limit,
    );
  }
}

