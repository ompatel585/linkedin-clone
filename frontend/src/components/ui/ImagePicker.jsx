import toast from "react-hot-toast";
import { readImageFile } from "../../lib/utils";

// A clickable (and keyboard-accessible) control that opens the file chooser and
// calls onChange with a resized data URL once an image is picked.
const ImagePicker = ({ onChange, children, className, label, maxSize }) => {
    const handleChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        try {
            onChange(await readImageFile(file, { maxSize }));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <label
            className={className}
            role="button"
            tabIndex={0}
            aria-label={label}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.currentTarget.querySelector("input").click();
                }
            }}
        >
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
            {children}
        </label>
    );
};

export default ImagePicker;
