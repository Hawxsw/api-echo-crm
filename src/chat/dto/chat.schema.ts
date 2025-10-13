import { z } from 'zod';

/**
 * Schema para criar chat
 */
export const CreateChatSchema = z.object({
  name: z.string().min(1).optional(),
  isGroup: z.boolean().default(false),
  participantIds: z.array(z.string().uuid()).min(1, 'Pelo menos um participante é necessário'),
});

/**
 * Schema para enviar mensagem
 */
export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  chatId: z.string().uuid('ID do chat inválido'),
});

/**
 * Schema para atualizar mensagem
 */
export const UpdateMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
});

/**
 * Schema para marcar mensagens como lidas
 */
export const MarkAsReadSchema = z.object({
  chatId: z.string().uuid('ID do chat inválido'),
});

