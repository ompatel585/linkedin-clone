import { useState } from "react";
import toast from "react-hot-toast";
import { Camera, Trash2 } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import ImagePicker from "../../../components/ui/ImagePicker";
import Modal from "../../../components/ui/Modal";
import { TextInput } from "../../../components/ui/FormField";
import { Banner } from "../../feed/components/Sidebars";
import { useUpdateProfile } from "../api";

const FIELDS = ["name", "username", "headline", "location", "website", "openToWork", "profilePicture", "bannerImage"];

const EditProfileModal = ({ user, open, onClose }) => {
    const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f, user[f] ?? ""])));
    const { mutate: update, isPending, error } = useUpdateProfile();
    const errors = Object.fromEntries((error?.response?.data?.details || []).map((d) => [d.path, d.message]));

    const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));
    const bind = (field) => ({ value: form[field], onChange: (e) => set(field)(e.target.value) });

    const save = () => {
        // Only send what changed
        const changes = Object.fromEntries(FIELDS.filter((f) => form[f] !== (user[f] ?? "")).map((f) => [f, form[f]]));
        if (!Object.keys(changes).length) return onClose();
        update(changes, {
            onSuccess: () => {
                toast.success("Profile updated");
                onClose();
            },
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit intro"
            size="lg"
            footer={
                <button className="btn btn-primary" onClick={save} disabled={isPending}>
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Save
                </button>
            }
        >
            <div className="relative rounded-box overflow-hidden">
                <Banner user={{ bannerImage: form.bannerImage }} className="h-32" />
                <div className="absolute top-2 right-2 flex gap-2">
                    <ImagePicker
                        onChange={set("bannerImage")}
                        maxSize={1800}
                        className="btn btn-sm btn-circle bg-base-100/90"
                        label="Change cover photo"
                    >
                        <Camera className="size-4" />
                    </ImagePicker>
                    {form.bannerImage && (
                        <button className="btn btn-sm btn-circle bg-base-100/90" onClick={() => set("bannerImage")("")} aria-label="Remove cover photo">
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-end gap-3 -mt-10 ml-4">
                <Avatar user={{ ...user, profilePicture: form.profilePicture }} size="xl" className="ring-4 ring-base-100 rounded-full" />
                <ImagePicker onChange={set("profilePicture")} maxSize={600} className="btn btn-sm btn-outline">
                    <Camera className="size-4" /> Photo
                </ImagePicker>
                {form.profilePicture && (
                    <button className="btn btn-sm btn-ghost text-error" onClick={() => set("profilePicture")("")}>
                        Remove
                    </button>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 mt-4">
                <TextInput label="Name" {...bind("name")} error={errors.name} maxLength={60} />
                <TextInput label="Username" {...bind("username")} error={errors.username} maxLength={30} />
            </div>
            <TextInput label="Headline" {...bind("headline")} error={errors.headline} maxLength={220} />
            <div className="grid sm:grid-cols-2 gap-x-4">
                <TextInput label="Location" {...bind("location")} placeholder="City, Country" maxLength={100} />
                <TextInput label="Website" {...bind("website")} placeholder="https://" maxLength={200} />
            </div>
            <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={form.openToWork}
                    onChange={(e) => set("openToWork")(e.target.checked)}
                />
                <span>
                    <span className="font-medium">Open to work</span>
                    <span className="block text-xs text-muted">Adds a green #OpenToWork frame to your photo</span>
                </span>
            </label>
        </Modal>
    );
};

export default EditProfileModal;
