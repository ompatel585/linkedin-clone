import { z } from "zod";

export const startConversationSchema = z.object({ userId: z.string().min(1) });

export const sendMessageSchema = z.object({
    text: z.string().trim().min(1, "Message can't be empty").max(4000),
});
