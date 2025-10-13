import { z } from 'zod';

/**
 * Schema para criar conversa do WhatsApp
 */
export const CreateConversationSchema = z.object({
  clientName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  clientPhone: z.string().min(10, 'Telefone inválido'),
  assignedToId: z.string().uuid().optional(),
});

/**
 * Schema para enviar mensagem no WhatsApp
 */
export const SendWhatsAppMessageSchema = z.object({
  conversationId: z.string().uuid('ID da conversa inválido'),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  isFromClient: z.boolean().default(false),
});

/**
 * Schema para atualizar conversa do WhatsApp
 */
export const UpdateConversationSchema = z.object({
  clientName: z.string().min(2).optional(),
  assignedToId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

