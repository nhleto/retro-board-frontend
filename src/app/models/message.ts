import { z } from 'zod';

export const MessageSchema = z.object({
  text: z.string().optional(),
});

export const MessageTypeSchema = z.enum(['learned', 'liked', 'lacked', 'text']);

export const MessageRequestSchema = z.object({
  type: MessageTypeSchema,
  message: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageRequest = z.infer<typeof MessageRequestSchema>;
export type MessageEnum = z.infer<typeof MessageTypeSchema>;
