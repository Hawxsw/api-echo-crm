import { z } from 'zod';

/**
 * Enum de tipos de notificação
 */
export const NotificationTypeEnum = z.enum([
  'MESSAGE',
  'TASK_ASSIGNED',
  'TASK_COMMENT',
  'TASK_DUE_SOON',
  'WHATSAPP_MESSAGE',
  'SALES_ASSIGNED',
  'SALES_COMMENT',
  'MENTION',
  'SYSTEM',
]);

/**
 * Schema para criar notificação
 */
export const CreateNotificationSchema = z.object({
  type: NotificationTypeEnum,
  title: z.string().min(1, 'Título não pode estar vazio'),
  message: z.string().min(1, 'Mensagem não pode estar vazia'),
  userId: z.string().uuid('ID do usuário inválido'),
  metadata: z.any().optional(),
  actionUrl: z.string().url('URL inválida').or(z.string().startsWith('/')).optional(),
});

/**
 * Schema para marcar notificações como lidas
 */
export const MarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid('ID da notificação inválido')).min(1, 'Pelo menos uma notificação deve ser informada'),
});

/**
 * Schema para marcar todas como lidas
 */
export const MarkAllAsReadSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
});

