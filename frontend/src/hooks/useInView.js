import { useEffect, useRef } from "react";

// Calls `onEnter` whenever the returned ref's element scrolls into view. Used for infinite lists.
export const useInView = (onEnter, { enabled = true, rootMargin = "400px" } = {}) => {
    const ref = useRef(null);
    const callback = useRef(onEnter);

    useEffect(() => {
        callback.current = onEnter;
    });

    useEffect(() => {
        const node = ref.current;
        if (!node || !enabled) return;
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && callback.current(),
            { rootMargin }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [enabled, rootMargin]);

    return ref;
};
