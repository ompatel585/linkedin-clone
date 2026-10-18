import { useState } from "react";
import toast from "react-hot-toast";
import { Bookmark, BookmarkCheck, Ellipsis, Link2, MessageCircle, Pencil, Repeat2, Trash2 } from "lucide-react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Menu from "../../../components/ui/Menu";
import { Card } from "../../../components/ui/Feedback";
import { useCurrentUser } from "../../../hooks/useAuth";
import { REACTIONS } from "../../../lib/constants";
import { pluralize } from "../../../lib/utils";
import { useDeletePost, useReact, useToggleSavePost } from "../api";
import CommentSection from "./CommentSection";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import { EditPostModal, RepostModal } from "./PostModals";
import ReactionButton from "./ReactionButton";

const ReactionSummary = ({ reactions }) => {
    if (!reactions.length) return null;
    const top = Object.entries(
        reactions.reduce((acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }), {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    return (
        <span className="flex items-center gap-1">
            <span className="flex -space-x-1">
                {top.map(([type]) => (
                    <span key={type} className="size-5 grid place-items-center rounded-full bg-base-100 ring-1 ring-base-300 text-xs">
                        {REACTIONS[type]?.emoji}
                    </span>
                ))}
            </span>
            {reactions.length}
        </span>
    );
};

// The original post shown inside a repost
const EmbeddedPost = ({ post }) => {
    if (!post) {
        return <div className="mx-4 mb-3 rounded-box border border-base-300 p-4 text-sm text-muted">This post is no longer available.</div>;
    }
    return (
        <div className="mx-4 mb-3 rounded-box border border-base-300 overflow-hidden">
            <div className="p-3 space-y-2">
                <PostHeader author={post.author} createdAt={post.createdAt} editedAt={post.editedAt} postId={post._id} size="sm" />
                <PostContent text={post.content} />
            </div>
            {post.image && <img src={post.image} alt="" loading="lazy" className="w-full max-h-[420px] object-cover" />}
        </div>
    );
};

const PostCard = ({ post, defaultShowComments = false }) => {
    const me = useCurrentUser();
    const [showComments, setShowComments] = useState(defaultShowComments);
    const [modal, setModal] = useState(null); // "edit" | "repost" | "delete"

    const { mutate: react } = useReact();
    const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
    const { mutate: toggleSave } = useToggleSavePost();

    const isOwner = post.author?._id === me._id;
    const isSaved = me.savedPosts?.includes(post._id);
    const myReaction = post.reactions.find((r) => r.user === me._id)?.type;
    // repostOf is null (not missing) when the original post was deleted
    const isRepost = post.repostOf !== undefined;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
            toast.success("Link copied");
        } catch {
            toast.error("Couldn't copy the link");
        }
    };

    return (
        <Card as="article" className="overflow-visible">
            <div className="p-4 pb-2">
                <PostHeader author={post.author} createdAt={post.createdAt} editedAt={post.editedAt} postId={post._id}>
                    <Menu
                        trigger={({ toggle }) => (
                            <button className="btn btn-ghost btn-sm btn-circle" onClick={toggle} aria-label="Post options">
                                <Ellipsis className="size-5" />
                            </button>
                        )}
                        items={[
                            { label: isSaved ? "Unsave" : "Save", icon: isSaved ? BookmarkCheck : Bookmark, onClick: () => toggleSave(post._id) },
                            { label: "Copy link to post", icon: Link2, onClick: copyLink },
                            isOwner && { label: "Edit post", icon: Pencil, onClick: () => setModal("edit") },
                            isOwner && { label: "Delete post", icon: Trash2, onClick: () => setModal("delete"), danger: true },
                        ]}
                    />
                </PostHeader>
                {post.content && (
                    <div className="mt-3">
                        <PostContent text={post.content} />
                    </div>
                )}
            </div>

            {isRepost ? (
                <EmbeddedPost post={post.repostOf} />
            ) : (
                post.image && <img src={post.image} alt="" loading="lazy" className="w-full max-h-[560px] object-cover bg-base-200 mt-2" />
            )}

            {(post.reactions.length > 0 || post.comments.length > 0 || post.repostCount > 0) && (
                <div className="px-4 py-2 flex items-center gap-3 text-xs text-muted">
                    <ReactionSummary reactions={post.reactions} />
                    <span className="ml-auto flex gap-3">
                        {post.comments.length > 0 && (
                            <button className="hover:text-primary hover:underline" onClick={() => setShowComments(true)}>
                                {pluralize(post.comments.length, "comment")}
                            </button>
                        )}
                        {post.repostCount > 0 && <span>{pluralize(post.repostCount, "repost")}</span>}
                    </span>
                </div>
            )}

            <div className="mx-2 border-t border-base-300 grid grid-cols-3 gap-1 py-1">
                <ReactionButton
                    current={myReaction}
                    onReact={(type) => react({ id: post._id, type, userId: me._id, current: post.reactions })}
                />
                <button className="btn btn-ghost btn-sm rounded-md gap-2 text-muted font-semibold" onClick={() => setShowComments((v) => !v)}>
                    <MessageCircle className="size-5" />
                    <span className="hidden sm:inline">Comment</span>
                </button>
                <button className="btn btn-ghost btn-sm rounded-md gap-2 text-muted font-semibold" onClick={() => setModal("repost")}>
                    <Repeat2 className="size-5" />
                    <span className="hidden sm:inline">Repost</span>
                </button>
            </div>

            {showComments && <CommentSection post={post} showAll={defaultShowComments} />}

            {modal === "edit" && <EditPostModal post={post} open onClose={() => setModal(null)} />}
            {modal === "repost" && <RepostModal post={post} open onClose={() => setModal(null)} />}
            {modal === "delete" && (
                <ConfirmDialog
                    open
                    onClose={() => setModal(null)}
                    title="Delete post?"
                    message="This can't be undone. The post will be removed from your profile and feeds."
                    loading={isDeleting}
                    onConfirm={() =>
                        deletePost(post._id, {
                            onSuccess: () => {
                                toast.success("Post deleted");
                                setModal(null);
                            },
                        })
                    }
                />
            )}
        </Card>
    );
};

export default PostCard;
