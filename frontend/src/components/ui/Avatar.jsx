import { Link } from "react-router";
import { cn, initials } from "../../lib/utils";

const SIZES = {
    "2xs": "size-6 text-[10px]",
    xs: "size-8 text-xs",
    sm: "size-10 text-sm",
    md: "size-12 text-base",
    lg: "size-16 text-lg",
    xl: "size-24 text-2xl",
    "2xl": "size-32 sm:size-40 text-4xl",
};

const DOT_SIZES = { "2xs": "size-2", xs: "size-2.5", sm: "size-3", md: "size-3.5", lg: "size-4", xl: "size-5", "2xl": "size-6" };

// Deterministic background color for initials so each person is recognisable
const PALETTE = ["bg-sky-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-teal-600", "bg-indigo-600"];
const colorFor = (seed = "") => PALETTE[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length];

const Avatar = ({ user, size = "md", online = false, showOpenToWork = false, link = false, className }) => {
    const name = user?.name ?? "";
    const ring = showOpenToWork && user?.openToWork;

    const content = (
        <span className={cn("relative inline-flex shrink-0", className)}>
            {user?.profilePicture ? (
                <img
                    src={user.profilePicture}
                    alt={name}
                    loading="lazy"
                    className={cn(SIZES[size], "rounded-full object-cover bg-base-300", ring && "ring-4 ring-success")}
                />
            ) : (
                <span
                    aria-label={name}
                    className={cn(
                        SIZES[size],
                        colorFor(user?.username || name),
                        "rounded-full grid place-items-center font-semibold text-white select-none",
                        ring && "ring-4 ring-success"
                    )}
                >
                    {initials(name)}
                </span>
            )}
            {online && (
                <span
                    title="Online"
                    className={cn(DOT_SIZES[size], "absolute bottom-0 right-0 rounded-full bg-success ring-2 ring-base-100")}
                />
            )}
        </span>
    );

    if (link && user?.username) {
        return (
            <Link to={`/profile/${user.username}`} className="shrink-0">
                {content}
            </Link>
        );
    }
    return content;
};

export default Avatar;
