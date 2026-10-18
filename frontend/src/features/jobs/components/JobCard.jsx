import { Bookmark, BookmarkCheck } from "lucide-react";
import { APPLICATION_STATUSES, WORKPLACE_TYPES } from "../../../lib/constants";
import { cn, formatSalary, pluralize, timeAgo } from "../../../lib/utils";

export const CompanyLogo = ({ company, size = "size-12" }) => (
    <div className={cn(size, "rounded-md bg-secondary text-secondary-content grid place-items-center font-bold text-lg shrink-0")}>
        {company?.[0]?.toUpperCase() ?? "?"}
    </div>
);

const JobCard = ({ job, active, onSelect }) => {
    const salary = formatSalary(job.salaryMin, job.salaryMax);
    return (
        <button
            onClick={() => onSelect(job)}
            className={cn(
                "w-full text-left flex gap-3 p-4 border-l-4 transition-colors",
                active ? "border-primary bg-secondary/40" : "border-transparent hover:bg-base-200"
            )}
        >
            <CompanyLogo company={job.company} />
            <div className="min-w-0 flex-1">
                <p className={cn("font-semibold text-primary line-clamp-2", active && "underline")}>{job.title}</p>
                <p className="text-sm">{job.company}</p>
                <p className="text-sm text-muted">
                    {[job.location, WORKPLACE_TYPES[job.workplaceType]].filter(Boolean).join(" · ")}
                </p>
                {salary && <p className="text-xs text-muted mt-0.5">{salary}</p>}
                <p className="text-xs text-muted mt-1 flex flex-wrap gap-x-2">
                    <span>{timeAgo(job.createdAt)}</span>
                    {job.applicantCount > 0 && <span className="text-success">{pluralize(job.applicantCount, "applicant")}</span>}
                    {!job.isOpen && <span className="text-error">Closed</span>}
                </p>
                {job.myApplication && (
                    <span className={cn("badge badge-sm mt-2", APPLICATION_STATUSES[job.myApplication.status]?.badge)}>
                        Applied · {APPLICATION_STATUSES[job.myApplication.status]?.label}
                    </span>
                )}
            </div>
            {job.isSaved ? (
                <BookmarkCheck className="size-5 text-primary shrink-0" aria-label="Saved" />
            ) : (
                <Bookmark className="size-5 text-muted shrink-0 opacity-0" aria-hidden />
            )}
        </button>
    );
};

export default JobCard;
