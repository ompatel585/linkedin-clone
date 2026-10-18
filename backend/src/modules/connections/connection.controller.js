import ConnectionRequest from "../../models/connectionRequest.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { env } from "../../config/env.js";
import { sendConnectionAcceptedEmail } from "../../emails/emailHandlers.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, idEquals } from "../../utils/query.js";
import { notify, retractNotification } from "../notifications/notification.service.js";

const isConnected = (user, otherId) => user.connections.some((id) => idEquals(id, otherId));

const findPendingRequestForRecipient = async (requestId, userId) => {
    assertObjectId(requestId, "request id");
    const request = await ConnectionRequest.findById(requestId);
    if (!request) throw ApiError.notFound("Connection request not found");
    if (!idEquals(request.recipient, userId)) throw ApiError.forbidden("Not authorized to respond to this request");
    if (request.status !== "pending") throw ApiError.badRequest("This request has already been processed");
    return request;
};

export const sendConnectionRequest = async (req, res) => {
    const { userId } = req.params;
    assertObjectId(userId, "user id");
    const me = req.user;

    if (idEquals(me._id, userId)) throw ApiError.badRequest("You can't send a request to yourself");
    if (isConnected(me, userId)) throw ApiError.badRequest("You are already connected");
    if (!(await User.exists({ _id: userId }))) throw ApiError.notFound("User not found");

    const existing = await ConnectionRequest.findOne({
        $or: [
            { sender: me._id, recipient: userId },
            { sender: userId, recipient: me._id },
        ],
        status: "pending",
    });
    if (existing) throw ApiError.badRequest("A connection request already exists");

    const request = await ConnectionRequest.create({ sender: me._id, recipient: userId });
    await notify({ recipient: userId, type: "connectionRequest", relatedUser: me._id });

    res.status(201).json({ message: "Connection request sent", request });
};

export const withdrawConnectionRequest = async (req, res) => {
    const { userId } = req.params;
    assertObjectId(userId, "user id");

    const request = await ConnectionRequest.findOneAndDelete({
        sender: req.user._id,
        recipient: userId,
        status: "pending",
    });
    if (!request) throw ApiError.notFound("No pending request to withdraw");
    await retractNotification({ recipient: userId, relatedUser: req.user._id, type: "connectionRequest" });

    res.json({ message: "Connection request withdrawn" });
};

export const acceptConnectionRequest = async (req, res) => {
    const me = req.user;
    const request = await findPendingRequestForRecipient(req.params.requestId, me._id);

    request.status = "accepted";
    await request.save();

    await User.updateOne({ _id: request.sender }, { $addToSet: { connections: me._id } });
    await User.updateOne({ _id: me._id }, { $addToSet: { connections: request.sender } });
    await retractNotification({ recipient: me._id, relatedUser: request.sender, type: "connectionRequest" });
    await notify({ recipient: request.sender, type: "connectionAccepted", relatedUser: me._id });

    res.json({ message: "Connection accepted" });

    const sender = await User.findById(request.sender).select("name email");
    if (sender) {
        sendConnectionAcceptedEmail(sender.email, sender.name, me.name, `${env.clientUrl}/profile/${me.username}`);
    }
};

export const rejectConnectionRequest = async (req, res) => {
    const request = await findPendingRequestForRecipient(req.params.requestId, req.user._id);
    request.status = "rejected";
    await request.save();
    await retractNotification({ recipient: req.user._id, relatedUser: request.sender, type: "connectionRequest" });
    res.json({ message: "Connection request ignored" });
};

export const getConnectionRequests = async (req, res) => {
    const requests = await ConnectionRequest.find({ recipient: req.user._id, status: "pending" })
        .sort({ createdAt: -1 })
        .populate("sender", `${USER_PREVIEW} connections`);
    res.json(requests);
};

export const getSentConnectionRequests = async (req, res) => {
    const requests = await ConnectionRequest.find({ sender: req.user._id, status: "pending" })
        .sort({ createdAt: -1 })
        .populate("recipient", USER_PREVIEW);
    res.json(requests);
};

export const getUserConnections = async (req, res) => {
    const user = await User.findById(req.user._id).populate("connections", `${USER_PREVIEW} connections`);
    res.json(user.connections);
};

export const removeConnection = async (req, res) => {
    const { userId } = req.params;
    assertObjectId(userId, "user id");

    await User.updateOne({ _id: req.user._id }, { $pull: { connections: userId } });
    await User.updateOne({ _id: userId }, { $pull: { connections: req.user._id } });

    res.json({ message: "Connection removed" });
};

export const getConnectionStatus = async (req, res) => {
    const { userId } = req.params;
    assertObjectId(userId, "user id");
    const me = req.user;

    if (isConnected(me, userId)) return res.json({ status: "connected" });

    const pending = await ConnectionRequest.findOne({
        $or: [
            { sender: me._id, recipient: userId },
            { sender: userId, recipient: me._id },
        ],
        status: "pending",
    });

    if (!pending) return res.json({ status: "not_connected" });
    if (idEquals(pending.sender, me._id)) return res.json({ status: "pending", requestId: pending._id });
    res.json({ status: "received", requestId: pending._id });
};
