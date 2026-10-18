import { differenceInSeconds, format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

const toDate = (value) => (value instanceof Date ? value : typeof value === "string" ? parseISO(value) : new Date(value));

// "now", "5m", "3h", "2d", then a date
export const timeAgo = (value) => {
    const date = toDate(value);
    if (!isValid(date)) return "";
    const seconds = differenceInSeconds(new Date(), date);
    if (seconds < 45) return "now";
    if (seconds < 7 * 24 * 3600) {
        return formatDistanceToNowStrict(date)
            .replace(/ minutes?/, "m")
            .replace(/ hours?/, "h")
            .replace(/ days?/, "d")
            .replace(/ seconds?/, "s");
    }
    return format(date, date.getFullYear() === new Date().getFullYear() ? "MMM d" : "MMM d, yyyy");
};

export const formatMonthYear = (value) => {
    if (!value) return "Present";
    const date = toDate(value);
    return isValid(date) ? format(date, "MMM yyyy") : "Present";
};

export const formatMessageTime = (value) => {
    const date = toDate(value);
    if (!isValid(date)) return "";
    return differenceInSeconds(new Date(), date) < 24 * 3600 ? format(date, "p") : format(date, "MMM d, p");
};

export const toInputDate = (value) => {
    if (!value) return "";
    const date = toDate(value);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "";
};

export const formatCount = (n = 0) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);

export const pluralize = (count, word, plural = `${word}s`) => `${formatCount(count)} ${count === 1 ? word : plural}`;

export const initials = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?";

export const formatSalary = (min, max) => {
    const fmt = (n) => `$${formatCount(n)}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
};

// Reads an image file, downsizing it so uploads stay small. Returns a data URL.
export const readImageFile = (file, { maxSize = 1600, quality = 0.85 } = {}) =>
    new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file"));
        if (file.size > 15 * 1024 * 1024) return reject(new Error("Image must be smaller than 15 MB"));

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Couldn't read that file"));
        reader.onload = () => {
            if (file.type === "image/gif") return resolve(reader.result);
            const img = new Image();
            img.onerror = () => reject(new Error("Couldn't read that image"));
            img.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
