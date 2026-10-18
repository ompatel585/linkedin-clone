import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// Accessible modal built on the native <dialog> element (focus trap + Esc for free).
// Mark the field that should receive focus with data-autofocus.
const Modal = ({ open, onClose, title, children, footer, size = "md", className }) => {
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            // showModal() moves focus to the first button; prefer the field marked for focus
            dialog.querySelector("[data-autofocus]")?.focus();
        }
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

    return (
        <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose} onCancel={onClose}>
            {open && (
                <div className={cn("modal-box p-0 flex flex-col max-h-[90vh]", widths[size], className)}>
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-base-300">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
                            <X className="size-5" />
                        </button>
                    </div>
                    <div className="px-5 py-4 overflow-y-auto">{children}</div>
                    {footer && <div className="px-5 py-3 border-t border-base-300 flex justify-end gap-2">{footer}</div>}
                </div>
            )}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default Modal;
