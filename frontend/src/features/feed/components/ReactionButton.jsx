import { useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { REACTIONS } from "../../../lib/constants";
import { cn } from "../../../lib/utils";

// Click toggles your reaction (Like by default); hover or long-press opens the picker.
const ReactionButton = ({ current, onReact, className }) => {
    const [open, setOpen] = useState(false);
    const timer = useRef(null);

    const show = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(true), 350);
    };
    const hide = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(false), 250);
    };

    const choose = (type) => {
        clearTimeout(timer.current);
        setOpen(false);
        onReact(type);
    };

    const meta = current ? REACTIONS[current] : null;

    return (
        <div className={cn("relative", className)} onMouseEnter={show} onMouseLeave={hide}>
            {open && (
                <div
                    role="toolbar"
                    aria-label="Reactions"
                    className="absolute bottom-full left-0 mb-2 flex gap-1 bg-base-100 border border-base-300 rounded-full shadow-xl px-2 py-1.5 z-20 animate-pop"
                >
                    {Object.entries(REACTIONS).map(([type, { emoji, label }]) => (
                        <button
                            key={type}
                            className="text-2xl px-1 transition-transform hover:scale-125 hover:-translate-y-1"
                            title={label}
                            aria-label={label}
                            onClick={() => choose(type)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
            <button
                className={cn("btn btn-ghost btn-sm w-full gap-2 rounded-md font-semibold", meta ? meta.className : "text-muted")}
                onClick={() => choose(current || "like")}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                aria-pressed={Boolean(current)}
            >
                {meta ? <span className="text-lg leading-none">{meta.emoji}</span> : <ThumbsUp className="size-5" />}
                <span className="hidden sm:inline">{meta ? meta.label : "Like"}</span>
            </button>
        </div>
    );
};

export default ReactionButton;
