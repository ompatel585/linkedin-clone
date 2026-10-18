import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
    getConversation,
    getMessages,
    getUnreadConversationCount,
    listConversations,
    markConversationRead,
    sendMessage,
    startConversation,
} from "./message.controller.js";
import { sendMessageSchema, startConversationSchema } from "./message.validation.js";

const router = Router();

router.use(protectRoute);

router.get("/unread-count", getUnreadConversationCount);
router.get("/conversations", listConversations);
router.post("/conversations", validateBody(startConversationSchema), startConversation);
router.get("/conversations/:id", getConversation);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", validateBody(sendMessageSchema), sendMessage);
router.put("/conversations/:id/read", markConversationRead);

export default router;
