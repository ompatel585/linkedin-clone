import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bookmark, BriefcaseBusiness, FileCheck2, Plus } from "lucide-react";
import { Card, EmptyState, ListSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppliedJobs, useMyJobs, useSavedJobs } from "./api";
import JobCard from "./components/JobCard";
import JobFormModal from "./components/JobFormModal";

const TABS = {
    saved: { label: "Saved", icon: Bookmark, hook: useSavedJobs, empty: "Jobs you save will appear here." },
    applied: { label: "Applied", icon: FileCheck2, hook: useAppliedJobs, empty: "Track the status of your applications here." },
    posted: { label: "Posted", icon: BriefcaseBusiness, hook: useMyJobs, empty: "Hiring? Post a job to find great candidates." },
};

const JobsTab = ({ tab }) => {
    const navigate = useNavigate();
    const { data: jobs = [], isPending } = TABS[tab].hook();

    if (isPending) return <ListSkeleton />;
    if (!jobs.length) return <EmptyState icon={TABS[tab].icon} title={`No ${TABS[tab].label.toLowerCase()} jobs`} description={TABS[tab].empty} />;

    return (
        <div className="divide-y divide-base-300">
            {jobs.map((job) => (
                <JobCard
                    key={job._id}
                    job={job}
                    onSelect={() => navigate(tab === "posted" ? `/jobs/${job._id}/applicants` : `/jobs/${job._id}`)}
                />
            ))}
        </div>
    );
};

const MyJobsPage = () => {
    useDocumentTitle("My jobs");
    const [tab, setTab] = useState("saved");
    const [posting, setPosting] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            <Card>
                <div className="flex items-center gap-2 p-4 border-b border-base-300">
                    <h1 className="text-lg font-semibold mr-auto">My jobs</h1>
                    <Link to="/jobs" className="btn btn-ghost btn-sm">
                        Browse jobs
                    </Link>
                    <button className="btn btn-primary btn-sm" onClick={() => setPosting(true)}>
                        <Plus className="size-4" /> Post a job
                    </button>
                </div>
                <div role="tablist" className="tabs tabs-border px-2">
                    {Object.entries(TABS).map(([id, { label }]) => (
                        <button key={id} role="tab" className={`tab ${tab === id ? "tab-active font-semibold" : ""}`} onClick={() => setTab(id)}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="border-t border-base-300">
                    <JobsTab key={tab} tab={tab} />
                </div>
            </Card>
            {posting && <JobFormModal open onClose={() => setPosting(false)} onSaved={(job) => navigate(`/jobs/${job._id}`)} />}
        </div>
    );
};

export default MyJobsPage;
