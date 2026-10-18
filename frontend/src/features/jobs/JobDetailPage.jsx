import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import NotFoundPage from "../../components/layout/NotFoundPage";
import { Card, ErrorState, Spinner } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useJob } from "./api";
import JobDetail from "./components/JobDetail";

const JobDetailPage = () => {
    const { jobId } = useParams();
    const { data: job, isPending, isError, error, refetch } = useJob(jobId);
    useDocumentTitle(job ? `${job.title} at ${job.company}` : "Job");

    if (isError && [400, 404].includes(error.response?.status)) {
        return <NotFoundPage title="Job not found" description="It may have been removed by the poster." />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            <Link to="/jobs" className="btn btn-ghost btn-sm">
                <ArrowLeft className="size-4" /> All jobs
            </Link>
            <Card>{isPending ? <Spinner /> : isError ? <ErrorState error={error} onRetry={refetch} /> : <JobDetail job={job} />}</Card>
        </div>
    );
};

export default JobDetailPage;
