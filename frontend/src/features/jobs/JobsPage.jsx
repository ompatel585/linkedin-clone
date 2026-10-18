import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, MapPin, Plus, Search } from "lucide-react";
import { Card, EmptyState, ErrorState, ListSkeleton, Spinner } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORKPLACE_TYPES } from "../../lib/constants";
import { cn, pluralize } from "../../lib/utils";
import { useJob, useJobs } from "./api";
import JobCard from "./components/JobCard";
import JobDetail from "./components/JobDetail";
import JobFormModal from "./components/JobFormModal";

const FILTERS = [
    { key: "workplaceType", label: "Workplace", options: WORKPLACE_TYPES },
    { key: "employmentType", label: "Job type", options: EMPLOYMENT_TYPES },
    { key: "experienceLevel", label: "Experience", options: EXPERIENCE_LEVELS },
];

const JobsPage = () => {
    useDocumentTitle("Jobs");
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [posting, setPosting] = useState(false);
    const [draft, setDraft] = useState({ q: params.get("q") ?? "", location: params.get("location") ?? "" });

    const filters = {
        q: params.get("q") ?? "",
        location: params.get("location") ?? "",
        workplaceType: params.get("workplaceType") ?? "",
        employmentType: params.get("employmentType") ?? "",
        experienceLevel: params.get("experienceLevel") ?? "",
        page: Number(params.get("page")) || 1,
    };
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useJobs(filters);
    const selectedId = params.get("selected") ?? (isDesktop ? data?.items[0]?._id : null);
    const { data: selected, isPending: loadingSelected } = useJob(isDesktop ? selectedId : null);

    const setFilter = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
        if (!("page" in changes)) next.delete("page");
        if (!("selected" in changes)) next.delete("selected");
        setParams(next, { replace: "selected" in changes });
    };

    const select = (job) => (isDesktop ? setFilter({ selected: job._id, page: filters.page > 1 ? filters.page : "" }) : navigate(`/jobs/${job._id}`));

    return (
        <div className="space-y-3">
            <Card className="p-4">
                <form
                    className="flex flex-col sm:flex-row gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setFilter(draft);
                    }}
                >
                    <label className="input flex-1">
                        <Search className="size-4 opacity-60" />
                        <input
                            placeholder="Title, skill or company"
                            value={draft.q}
                            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                            aria-label="Search jobs"
                        />
                    </label>
                    <label className="input sm:w-56">
                        <MapPin className="size-4 opacity-60" />
                        <input
                            placeholder="City, country or remote"
                            value={draft.location}
                            onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                            aria-label="Location"
                        />
                    </label>
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </form>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    {FILTERS.map(({ key, label, options }) => (
                        <select
                            key={key}
                            className={cn("select select-sm w-auto rounded-full", filters[key] && "select-success font-medium")}
                            value={filters[key]}
                            onChange={(e) => setFilter({ [key]: e.target.value })}
                            aria-label={label}
                        >
                            <option value="">{label}</option>
                            {Object.entries(options).map(([value, text]) => (
                                <option key={value} value={value}>
                                    {text}
                                </option>
                            ))}
                        </select>
                    ))}
                    {(filters.workplaceType || filters.employmentType || filters.experienceLevel || filters.q || filters.location) && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                                setDraft({ q: "", location: "" });
                                setParams({});
                            }}
                        >
                            Reset
                        </button>
                    )}
                    <div className="ml-auto flex gap-2">
                        <Link to="/jobs/my" className="btn btn-ghost btn-sm">
                            My jobs
                        </Link>
                        <button className="btn btn-outline btn-primary btn-sm" onClick={() => setPosting(true)}>
                            <Plus className="size-4" /> Post a job
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden lg:h-[calc(100dvh-15rem)] lg:min-h-[480px]">
                <div className={cn("lg:border-r border-base-300 flex flex-col min-h-0", isPlaceholderData && "opacity-60")}>
                    <div className="px-4 py-3 border-b border-base-300">
                        <h1 className="font-semibold">{filters.q ? `“${filters.q}” jobs` : "Recommended jobs"}</h1>
                        {data && <p className="text-xs text-muted">{pluralize(data.total, "result")}</p>}
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-base-300">
                        {isPending ? (
                            <ListSkeleton />
                        ) : isError ? (
                            <ErrorState error={error} onRetry={refetch} />
                        ) : data.items.length ? (
                            data.items.map((job) => <JobCard key={job._id} job={job} active={isDesktop && job._id === selectedId} onSelect={select} />)
                        ) : (
                            <EmptyState icon={BriefcaseBusiness} title="No matching jobs" description="Try different keywords or remove some filters." />
                        )}
                    </div>
                    {data?.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 p-3 border-t border-base-300">
                            <button
                                className="btn btn-ghost btn-sm btn-circle"
                                disabled={filters.page <= 1}
                                onClick={() => setFilter({ page: filters.page - 1 })}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="text-sm">
                                Page {data.page} of {data.totalPages}
                            </span>
                            <button
                                className="btn btn-ghost btn-sm btn-circle"
                                disabled={filters.page >= data.totalPages}
                                onClick={() => setFilter({ page: filters.page + 1 })}
                                aria-label="Next page"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="hidden lg:block overflow-y-auto scrollbar-thin">
                    {selectedId && loadingSelected ? <Spinner /> : selected ? <JobDetail job={selected} onDeleted={() => setFilter({ selected: "" })} /> : null}
                </div>
            </Card>

            {posting && <JobFormModal open onClose={() => setPosting(false)} onSaved={(job) => navigate(`/jobs/${job._id}`)} />}
        </div>
    );
};

export default JobsPage;
