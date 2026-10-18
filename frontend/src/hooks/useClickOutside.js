import { useEffect, useRef } from "react";

export const useClickOutside = (onOutside, enabled = true) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!enabled) return;
        const handlePointer = (event) => {
            if (ref.current && !ref.current.contains(event.target)) onOutside();
        };
        const handleKey = (event) => event.key === "Escape" && onOutside();
        document.addEventListener("pointerdown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("pointerdown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [onOutside, enabled]);

    return ref;
};
