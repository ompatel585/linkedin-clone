import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { emitToUser, isOnline } from "../../sockets/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, buildCursorPage, cursorFilter, idEquals, parseLimit } from "../../utils/query.js";

const unreadFilter = (userId) => ({ sender: { $ne: userId }, readBy: { $ne: userId } });

const serializeConversation = (conversation, me, unreadCount = 0) => {
    const json = conversation.toJSON();
    const other = json.participants.find((p) => !idEquals(p, me._id)) || json.participants[0];
    return {
        _id: json._id,
        participant: other ? { ...other, isOnline: isOnline(other._id) } : null,
        lastMessage: json.lastMessage || null,
        lastMessageAt: json.lastMessageAt,
        unreadCount,
    };
};

const findMyConversation = async (id, userId) => {
    assertObjectId(id, "conversation id");
    const conversation = await Conversation.findOne({ _id: id, participants: userId });
    if (!conversation) throw ApiError.notFound("Conversation not found");
    return conversation;
};

const populateConversation = (query) =>
    query.populate("participants", `${USER_PREVIEW} lastSeen`).populate("lastMessage");

export const listConversations = async (req, res) => {
    const me = req.user;
    const conversations = await populateConversation(
        Conversation.find({ participants: me._id, lastMessage: { $exists: true } }).sort({ lastMessageAt: -1 })
    );

    const counts = await Message.aggregate([
        { $match: { conversation: { $in: conversations.map((c) => c._id) }, ...unreadFilter(me._id) } },
        { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.count]));

    res.json(conversations.map((c) => serializeConversation(c, me, countById.get(String(c._id)) || 0)));
};

export const startConversation = async (req, res) => {
    const me = req.user;
    const { userId } = req.body;
    assertObjectId(userId, "user id");
    if (idEquals(userId, me._id)) throw ApiError.badRequest("You can't message yourself");
    if (!(await User.exists({ _id: userId }))) throw ApiError.notFound("User not found");

    let conversation = await Conversation.findOne({ participants: { $all: [me._id, userId], $size: 2 } });
    if (!conversation) conversation = await Conversation.create({ participants: [me._id, userId] });

    conversation = await populateConversation(Conversation.findById(conversation._id));
    res.json(serializeConversation(conversation, me));
};

export const getConversation = async (req, res) => {
    const conversation = await findMyConversation(req.params.id, req.user._id);
    await conversation.populate([{ path: "participants", select: `${USER_PREVIEW} lastSeen` }, { path: "lastMessage" }]);
    const unread = await Message.countDocuments({ conversation: conversation._id, ...unreadFilter(req.user._id) });
    res.json(serializeConversation(conversation, req.user, unread));
};

export const getMessages = async (req, res) => {
    const conversation = await findMyConversation(req.params.id, req.user._id);
    const limit = parseLimit(req.query.limit, 30, 100);
    const messages = await Message.find({ conversation: conversation._id, ...cursorFilter(req.query.cursor) })
        .sort({ createdAt: -1 })
        .limit(limit + 1);
    res.json(buildCursorPage(messages, limit));
};

export const sendMessage = async (req, res) => {
    const me = req.user;
    const conversation = await findMyConversation(req.params.id, me._id);

    const message = await Message.create({
        conversation: conversation._id,
        sender: me._id,
        text: req.body.text,
        readBy: [me._id],
    });
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    conversation.participants.forEach((id) =>
        emitToUser(id, "message:new", { conversationId: String(conversation._id), message })
    );
    res.status(201).json(message);
};

export const markConversationRead = async (req, res) => {
    const me = req.user;
    const conversation = await findMyConversation(req.params.id, me._id);
    const result = await Message.updateMany(
        { conversation: conversation._id, ...unreadFilter(me._id) },
        { $addToSet: { readBy: me._id } }
    );

    if (result.modifiedCount) {
        conversation.participants.forEach((id) =>
            emitToUser(id, "conversation:read", { conversationId: String(conversation._id), userId: String(me._id) })
        );
    }
    res.json({ updated: result.modifiedCount });
};

export const getUnreadConversationCount = async (req, res) => {
    const conversationIds = await Conversation.find({ participants: req.user._id }).distinct("_id");
    const unread = await Message.distinct("conversation", {
        conversation: { $in: conversationIds },
        ...unreadFilter(req.user._id),
    });
    res.json({ count: unread.length });
};
