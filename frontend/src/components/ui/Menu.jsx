import { useCallback, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../lib/utils";

// Small dropdown menu. `items` is a list of { label, icon: Icon, onClick, danger }.
const Menu = ({ trigger, items, align = "right", className }) => {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const ref = useClickOutside(close, open);

    return (
        <div ref={ref} className={cn("relative", className)}>
            {trigger({ open, toggle: () => setOpen((v) => !v) })}
            {open && (
                <ul
                    role="menu"
                    className={cn(
                        "menu absolute z-30 mt-1 min-w-48 rounded-box bg-base-100 border border-base-300 shadow-lg p-1 animate-pop",
                        align === "right" ? "right-0" : "left-0"
                    )}
                >
                    {items.filter(Boolean).map(({ label, icon: Icon, onClick, danger }) => (
                        <li key={label}>
                            <button
                                role="menuitem"
                                className={cn("flex gap-3", danger && "text-error")}
                                onClick={() => {
                                    close();
                                    onClick();
                                }}
                            >
                                {Icon && <Icon className="size-4" />}
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Menu;
