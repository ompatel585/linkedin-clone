import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../../components/ui/Modal";
import Avatar from "../../../components/ui/Avatar";
import { useCurrentUser } from "../../../hooks/useAuth";
import PostContent from "./PostContent";
import { useRepost, useUpdatePost } from "../api";

export const EditPostModal = ({ post, open, onClose }) => {
    const [content, setContent] = useState(post.content);
    const { mutate: update, isPending } = useUpdatePost();

    const save = () =>
        update(
            { id: post._id, content },
            {
                onSuccess: () => {
                    toast.success("Post updated");
                    onClose();
                },
            }
        );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit post"
            footer={
                <button className="btn btn-primary" onClick={save} disabled={isPending || content === post.content}>
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Save
                </button>
            }
        >
            <textarea
                className="textarea w-full min-h-40 text-base border-0 focus:outline-none p-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={3000}
                data-autofocus
                aria-label="Post text"
            />
            {post.image && <img src={post.image} alt="" className="rounded-box mt-3 max-h-60 object-cover" />}
        </Modal>
    );
};

export const RepostModal = ({ post, open, onClose }) => {
    const me = useCurrentUser();
    const [content, setContent] = useState("");
    const { mutate: repost, isPending } = useRepost();
    const original = post.repostOf ?? post;

    const submit = () =>
        repost(
            { id: original._id, content },
            {
                onSuccess: () => {
                    toast.success("Reposted to your feed");
                    setContent("");
                    onClose();
                },
            }
        );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Repost"
            footer={
                <button className="btn btn-primary" onClick={submit} disabled={isPending}>
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Repost
                </button>
            }
        >
            <div className="flex items-center gap-3 mb-3">
                <Avatar user={me} size="sm" />
                <span className="font-semibold">{me.name}</span>
            </div>
            <textarea
                className="textarea w-full min-h-24 border-0 focus:outline-none p-0 text-base"
                placeholder="Add your thoughts (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={3000}
                aria-label="Your thoughts"
            />
            <div className="border border-base-300 rounded-box p-3 mt-3 text-sm">
                <p className="font-semibold mb-1">{original.author?.name}</p>
                <div className="line-clamp-4">
                    <PostContent text={original.content} />
                </div>
            </div>
        </Modal>
    );
};
