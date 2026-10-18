import { useState } from "react";
import { Link } from "react-router";
import { SendHorizontal, Trash2 } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useCurrentUser } from "../../../hooks/useAuth";
import { timeAgo } from "../../../lib/utils";
import { useAddComment, useDeleteComment } from "../api";

const PREVIEW_COUNT = 3;

const CommentSection = ({ post, showAll = false }) => {
    const me = useCurrentUser();
    const [content, setContent] = useState("");
    const [expanded, setExpanded] = useState(showAll);
    const { mutate: addComment, isPending } = useAddComment();
    const { mutate: deleteComment } = useDeleteComment();

    const comments = [...post.comments].reverse(); // newest first
    const visible = expanded ? comments : comments.slice(0, PREVIEW_COUNT);
    const isPostAuthor = post.author?._id === me._id;

    const submit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        addComment({ id: post._id, content }, { onSuccess: () => setContent("") });
    };

    return (
        <div className="px-4 pb-4 space-y-3">
            <form onSubmit={submit} className="flex items-center gap-2">
                <Avatar user={me} size="xs" />
                <label className="input input-sm flex-1 rounded-full">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a comment…"
                        maxLength={1500}
                        aria-label="Add a comment"
                    />
                    <button type="submit" className="text-primary disabled:opacity-40" disabled={!content.trim() || isPending} aria-label="Post comment">
                        {isPending ? <span className="loading loading-spinner loading-xs" /> : <SendHorizontal className="size-4" />}
                    </button>
                </label>
            </form>

            {visible.map((comment) => {
                const author = comment.user;
                const canDelete = author?._id === me._id || isPostAuthor;
                return (
                    <div key={comment._id} className="flex gap-2 group">
                        <Avatar user={author} size="xs" link />
                        <div className="flex-1 min-w-0 bg-base-200 rounded-lg rounded-tl-none px-3 py-2">
                            <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <Link to={`/profile/${author?.username}`} className="font-semibold text-sm hover:underline">
                                        {author?.name ?? "Deleted user"}
                                    </Link>
                                    {author?.headline && <p className="text-xs text-muted truncate">{author.headline}</p>}
                                </div>
                                <span className="text-xs text-muted shrink-0">{timeAgo(comment.createdAt)}</span>
                                {canDelete && (
                                    <button
                                        className="opacity-60 sm:opacity-0 group-hover:opacity-60 hover:opacity-100! hover:text-error"
                                        onClick={() => deleteComment({ postId: post._id, commentId: comment._id })}
                                        aria-label="Delete comment"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
                        </div>
                    </div>
                );
            })}

            {!expanded && comments.length > PREVIEW_COUNT && (
                <button className="btn btn-ghost btn-xs text-muted" onClick={() => setExpanded(true)}>
                    Load {comments.length - PREVIEW_COUNT} more comments
                </button>
            )}
        </div>
    );
};

export default CommentSection;
