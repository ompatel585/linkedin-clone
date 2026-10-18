import { useState } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon, X } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import ImagePicker from "../../../components/ui/ImagePicker";
import Modal from "../../../components/ui/Modal";
import { Card } from "../../../components/ui/Feedback";
import { useCurrentUser } from "../../../hooks/useAuth";
import { useCreatePost } from "../api";

const MAX_LENGTH = 3000;

const PostComposer = () => {
    const me = useCurrentUser();
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const { mutate: createPost, isPending } = useCreatePost();

    const reset = () => {
        setContent("");
        setImage("");
        setOpen(false);
    };

    const submit = () =>
        createPost(
            { content, image },
            {
                onSuccess: () => {
                    toast.success("Post shared");
                    reset();
                },
            }
        );

    return (
        <Card className="p-4">
            <div className="flex gap-3 items-center">
                <Avatar user={me} size="md" />
                <button
                    className="flex-1 text-left rounded-full border border-base-300 hover:bg-base-200 px-4 py-3 text-sm font-medium text-muted transition-colors"
                    onClick={() => setOpen(true)}
                >
                    Start a post
                </button>
            </div>
            <div className="flex mt-2 -mb-1">
                <ImagePicker
                    className="btn btn-ghost btn-sm gap-2 text-muted"
                    onChange={(img) => {
                        setImage(img);
                        setOpen(true);
                    }}
                >
                    <ImageIcon className="size-5 text-info" /> Photo
                </ImagePicker>
            </div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Create a post"
                footer={
                    <div className="flex items-center w-full gap-2">
                        <ImagePicker onChange={setImage} className="btn btn-ghost btn-circle btn-sm" label="Add photo">
                            <ImageIcon className="size-5" />
                        </ImagePicker>
                        <span className="ml-auto text-xs text-muted">
                            {content.length}/{MAX_LENGTH}
                        </span>
                        <button className="btn btn-primary btn-sm px-5" onClick={submit} disabled={isPending || (!content.trim() && !image)}>
                            {isPending && <span className="loading loading-spinner loading-xs" />}
                            Post
                        </button>
                    </div>
                }
            >
                <div className="flex items-center gap-3 mb-3">
                    <Avatar user={me} size="sm" />
                    <div>
                        <p className="font-semibold">{me.name}</p>
                        <p className="text-xs text-muted">Post to anyone</p>
                    </div>
                </div>
                <textarea
                    className="textarea w-full min-h-36 text-base border-0 focus:outline-none p-0 bg-transparent"
                    placeholder="What do you want to talk about? Use #hashtags to reach more people."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={MAX_LENGTH}
                    data-autofocus
                    aria-label="Post text"
                />
                {image && (
                    <div className="relative mt-2">
                        <img src={image} alt="Selected" className="rounded-box max-h-80 w-full object-cover" />
                        <button
                            className="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100/90"
                            onClick={() => setImage("")}
                            aria-label="Remove photo"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default PostComposer;
