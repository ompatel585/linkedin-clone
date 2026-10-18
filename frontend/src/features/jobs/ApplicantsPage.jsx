import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink, MessageSquareText, Users } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import NotFoundPage from "../../components/layout/NotFoundPage";
import { Card, EmptyState, ErrorState, ListSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { APPLICATION_STATUSES } from "../../lib/constants";
import { pluralize, timeAgo } from "../../lib/utils";
import { useStartConversation } from "../messaging/api";
import { useApplicants, useJob, useUpdateApplicationStatus } from "./api";

const ApplicantsPage = () => {
    const { jobId } = useParams();
    const { data: job } = useJob(jobId);
    const { data: applicants = [], isPending, isError, error, refetch } = useApplicants(jobId);
    const { mutate: updateStatus } = useUpdateApplicationStatus();
    const startConversation = useStartConversation();
    useDocumentTitle(job ? `Applicants · ${job.title}` : "Applicants");

    if (isError && error.response?.status === 403) {
        return <NotFoundPage title="Applicants are private" description="Only the person who posted this job can see who applied." />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            <Link to={`/jobs/${jobId}`} className="btn btn-ghost btn-sm">
                <ArrowLeft className="size-4" /> Back to job
            </Link>
            <Card>
                <div className="p-5 border-b border-base-300">
                    <h1 className="text-xl font-semibold">{job?.title ?? "Applicants"}</h1>
                    {job && (
                        <p className="text-sm text-muted">
                            {job.company} · {pluralize(applicants.length, "applicant")} · {job.isOpen ? "Open" : "Closed"}
                        </p>
                    )}
                </div>
                {isPending ? (
                    <ListSkeleton />
                ) : isError ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : !applicants.length ? (
                    <EmptyState icon={Users} title="No applicants yet" description="Share the job with your network to get applications." />
                ) : (
                    <ul className="divide-y divide-base-300">
                        {applicants.map((application) => {
                            const person = application.user;
                            return (
                                <li key={application._id} className="p-5 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar user={person} size="md" link showOpenToWork />
                                        <div className="min-w-0 flex-1">
                                            <Link to={`/profile/${person?.username}`} className="font-semibold hover:underline">
                                                {person?.name ?? "Deleted user"}
                                            </Link>
                                            <p className="text-sm text-muted line-clamp-1">{person?.headline}</p>
                                            <p className="text-xs text-muted">
                                                Applied {timeAgo(application.createdAt)}
                                                {person?.location && ` · ${person.location}`}
                                            </p>
                                        </div>
                                        <select
                                            className="select select-sm w-36"
                                            value={application.status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    { jobId, applicationId: application._id, status: e.target.value },
                                                    { onSuccess: () => toast.success("Status updated — the applicant was notified") }
                                                )
                                            }
                                            aria-label="Application status"
                                        >
                                            {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {person?.skills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {person.skills.slice(0, 8).map((skill) => (
                                                <span key={skill} className="badge badge-sm badge-ghost">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {application.coverLetter && (
                                        <blockquote className="text-sm whitespace-pre-wrap bg-base-200 rounded-box p-3">{application.coverLetter}</blockquote>
                                    )}
                                    <div className="flex gap-2">
                                        {application.resumeUrl && (
                                            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-outline btn-sm">
                                                <ExternalLink className="size-4" /> Resume
                                            </a>
                                        )}
                                        {person && (
                                            <button className="btn btn-ghost btn-sm" onClick={() => startConversation.mutate(person._id)}>
                                                <MessageSquareText className="size-4" /> Message
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default ApplicantsPage;
