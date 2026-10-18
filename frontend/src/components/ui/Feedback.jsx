import { cn } from "../../lib/utils";
import { getErrorMessage } from "../../lib/api";

export const Card = ({ as: Tag = "section", className, children, ...props }) => (
    <Tag className={cn("card-surface", className)} {...props}>
        {children}
    </Tag>
);

export const Spinner = ({ className }) => (
    <div className={cn("flex justify-center py-8", className)}>
        <span className="loading loading-spinner loading-md text-primary" />
    </div>
);

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
    <div className={cn("flex flex-col items-center text-center gap-2 px-6 py-12", className)}>
        {Icon && (
            <div className="size-14 rounded-full bg-secondary text-secondary-content grid place-items-center mb-2">
                <Icon className="size-7" />
            </div>
        )}
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && <p className="text-muted max-w-sm">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
    </div>
);

export const ErrorState = ({ error, onRetry }) => (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-error">{getErrorMessage(error)}</p>
        {onRetry && (
            <button className="btn btn-sm btn-outline" onClick={onRetry}>
                Try again
            </button>
        )}
    </div>
);

export const PostSkeleton = () => (
    <div className="card-surface p-4 space-y-4">
        <div className="flex gap-3 items-center">
            <div className="skeleton size-12 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-1/2" />
            </div>
        </div>
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-2/3" />
    </div>
);

export const ListSkeleton = ({ rows = 4 }) => (
    <div className="divide-y divide-base-300">
        {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex gap-3 items-center p-4">
                <div className="skeleton size-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-3 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);
