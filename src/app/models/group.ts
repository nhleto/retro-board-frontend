import {z} from 'zod';
import { MessagePayload } from './message';

export const GroupSchema = z.object({
  id: z.string(),
  messages: z.array(MessagePayload)
})

export type Group = z.infer<typeof GroupSchema>;
