import { z } from 'zod';

export const CreateChatSchema = z.object({
  name: z.string().min(1).optional(),
  isGroup: z.boolean().default(false),
  participantIds: z.array(z.string().uuid()).min(1, 'Pelo menos um participante é necessário'),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  chatId: z.string().uuid('ID do chat inválido'),
});

export const UpdateMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
});

export const MarkAsReadSchema = z.object({
  chatId: z.string().uuid('ID do chat inválido'),
});

