import ConnectionRequest from "../../models/connectionRequest.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { isOnline } from "../../sockets/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, idEquals, parseLimit } from "../../utils/query.js";
import { deleteImage, uploadImage } from "../../utils/upload.js";
import { notify, retractNotification } from "../notifications/notification.service.js";

export const getSuggestedConnections = async (req, res) => {
    const me = req.user;
    const limit = parseLimit(req.query.limit, 5, 30);

    const pending = await ConnectionRequest.find({
        $or: [{ sender: me._id }, { recipient: me._id }],
        status: "pending",
    })
        .select("sender recipient")
        .lean();
    const pendingIds = pending.map((r) => (idEquals(r.sender, me._id) ? r.recipient : r.sender));

    const suggestions = await User.aggregate([
        { $match: { _id: { $nin: [me._id, ...me.connections, ...pendingIds] } } },
        { $addFields: { mutualCount: { $size: { $setIntersection: ["$connections", me.connections] } } } },
        { $sort: { mutualCount: -1, createdAt: -1 } },
        { $limit: limit },
        { $project: { name: 1, username: 1, profilePicture: 1, headline: 1, openToWork: 1, mutualCount: 1 } },
    ]);

    res.json(suggestions);
};

export const getPublicProfile = async (req, res) => {
    const me = req.user;
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(
        "-savedPosts -savedJobs"
    );
    if (!user) throw ApiError.notFound("User not found");

    const isOwnProfile = idEquals(user._id, me._id);
    if (!isOwnProfile) {
        await User.updateOne({ _id: user._id }, { $inc: { profileViews: 1 } });
    }

    const mutualIds = isOwnProfile
        ? []
        : user.connections.filter((id) => me.connections.some((mine) => idEquals(mine, id)));
    const mutualConnections = await User.find({ _id: { $in: mutualIds.slice(0, 3) } }).select(USER_PREVIEW);

    res.json({
        ...user.toJSON(),
        connectionCount: user.connections.length,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: user.followers.some((id) => idEquals(id, me._id)),
        isOnline: isOnline(user._id),
        mutualConnectionCount: mutualIds.length,
        mutualConnections,
    });
};

export const updateProfile = async (req, res) => {
    const updates = { ...req.body };
    const current = req.user;

    for (const field of ["profilePicture", "bannerImage"]) {
        if (updates[field] === undefined || updates[field] === current[field]) {
            delete updates[field];
            continue;
        }
        const previous = current[field];
        updates[field] = updates[field] ? await uploadImage(updates[field], `unlinked/${field}`) : "";
        await deleteImage(previous);
    }

    const user = await User.findByIdAndUpdate(current._id, { $set: updates }, { new: true, runValidators: true });
    res.json(user);
};

export const toggleFollow = async (req, res) => {
    const { userId } = req.params;
    assertObjectId(userId, "user id");
    const me = req.user;

    if (idEquals(userId, me._id)) throw ApiError.badRequest("You can't follow yourself");
    if (!(await User.exists({ _id: userId }))) throw ApiError.notFound("User not found");

    const isFollowing = me.following.some((id) => idEquals(id, userId));

    if (isFollowing) {
        await User.updateOne({ _id: me._id }, { $pull: { following: userId } });
        await User.updateOne({ _id: userId }, { $pull: { followers: me._id } });
        await retractNotification({ recipient: userId, relatedUser: me._id, type: "follow" });
    } else {
        await User.updateOne({ _id: me._id }, { $addToSet: { following: userId } });
        await User.updateOne({ _id: userId }, { $addToSet: { followers: me._id } });
        await notify({ recipient: userId, type: "follow", relatedUser: me._id });
    }

    res.json({ following: !isFollowing });
};

export const getUserFollowers = async (req, res) => {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
        .select("followers following")
        .populate("followers", USER_PREVIEW)
        .populate("following", USER_PREVIEW);
    if (!user) throw ApiError.notFound("User not found");
    res.json({ followers: user.followers, following: user.following });
};

export const getProfileStats = async (req, res) => {
    const me = req.user;
    res.json({
        profileViews: me.profileViews,
        connectionCount: me.connections.length,
        followerCount: me.followers.length,
        followingCount: me.following.length,
        savedPostCount: me.savedPosts.length,
        savedJobCount: me.savedJobs.length,
    });
};
