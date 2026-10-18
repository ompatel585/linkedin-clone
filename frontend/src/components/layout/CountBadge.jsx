import { cn } from "../../lib/utils";

const CountBadge = ({ count, className }) =>
    count > 0 ? (
        <span
            className={cn(
                "absolute -top-1.5 left-1/2 ml-1 min-w-4.5 h-4.5 px-1 rounded-full bg-error text-error-content text-[11px] font-semibold grid place-items-center",
                className
            )}
        >
            {count > 99 ? "99+" : count}
        </span>
    ) : null;

export default CountBadge;
