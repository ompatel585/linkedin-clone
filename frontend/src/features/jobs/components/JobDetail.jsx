import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
    Bookmark,
    BookmarkCheck,
    BriefcaseBusiness,
    Building2,
    CircleDollarSign,
    Lock,
    LockOpen,
    MessageSquareText,
    Pencil,
    Trash2,
    Users,
} from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Modal from "../../../components/ui/Modal";
import { TextArea, TextInput } from "../../../components/ui/FormField";
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORKPLACE_TYPES } from "../../../lib/constants";
import { formatSalary, pluralize, timeAgo } from "../../../lib/utils";
import { useStartConversation } from "../../messaging/api";
import { useApplyToJob, useDeleteJob, useToggleSaveJob, useUpdateJob, useWithdrawApplication } from "../api";
import { CompanyLogo } from "./JobCard";
import JobFormModal from "./JobFormModal";

const ApplyModal = ({ job, open, onClose }) => {
    const [form, setForm] = useState({ coverLetter: "", resumeUrl: "" });
    const { mutate: apply, isPending, error } = useApplyToJob();
    const errors = Object.fromEntries((error?.response?.data?.details || []).map((d) => [d.path, d.message]));

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Apply to ${job.company}`}
            footer={
                <button
                    className="btn btn-primary"
                    disabled={isPending}
                    onClick={() =>
                        apply(
                            { id: job._id, ...form },
                            {
                                onSuccess: () => {
                                    toast.success("Application sent!");
                                    onClose();
                                },
                            }
                        )
                    }
                >
                    {isPending && <span className="loading loading-spinner loading-sm" />}
                    Submit application
                </button>
            }
        >
            <p className="text-sm text-muted mb-2">
                Your UnLinked profile will be shared with {job.postedBy?.name ?? "the poster"} along with your application.
            </p>
            <TextInput
                label="Resume link (optional)"
                placeholder="https://drive.google.com/…"
                value={form.resumeUrl}
                onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
                error={errors.resumeUrl}
            />
            <TextArea
                label="Cover letter (optional)"
                rows={7}
                maxLength={3000}
                value={form.coverLetter}
                onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
                placeholder="Why are you a great fit?"
            />
        </Modal>
    );
};

const JobDetail = ({ job, onDeleted }) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(null); // "apply" | "edit" | "delete" | "withdraw"
    const { mutate: toggleSave } = useToggleSaveJob();
    const { mutate: update, isPending: updating } = useUpdateJob();
    const { mutate: remove, isPending: deleting } = useDeleteJob();
    const { mutate: withdraw, isPending: withdrawing } = useWithdrawApplication();
    const startConversation = useStartConversation();

    const salary = formatSalary(job.salaryMin, job.salaryMax);
    const status = job.myApplication && APPLICATION_STATUSES[job.myApplication.status];

    return (
        <article className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <CompanyLogo company={job.company} size="size-14" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm">{job.company}</p>
                    <h1 className="text-2xl font-semibold leading-tight">{job.title}</h1>
                    <p className="text-sm text-muted mt-1">
                        {[job.location, `Posted ${timeAgo(job.createdAt)}`, job.applicantCount > 0 && pluralize(job.applicantCount, "applicant")]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                    <BriefcaseBusiness className="size-5 text-muted" />
                    <span className="badge badge-ghost">{WORKPLACE_TYPES[job.workplaceType]}</span>
                    <span className="badge badge-ghost">{EMPLOYMENT_TYPES[job.employmentType]}</span>
                    <span className="badge badge-ghost">{EXPERIENCE_LEVELS[job.experienceLevel]}</span>
                </li>
                {salary && (
                    <li className="flex items-center gap-2">
                        <CircleDollarSign className="size-5 text-muted" /> {salary} / year
                    </li>
                )}
                <li className="flex items-center gap-2">
                    <Building2 className="size-5 text-muted" /> {job.company}
                </li>
            </ul>

            <div className="flex flex-wrap gap-2 mt-5">
                {job.isOwner ? (
                    <>
                        <Link to={`/jobs/${job._id}/applicants`} className="btn btn-primary">
                            <Users className="size-4" /> View applicants ({job.applicantCount})
                        </Link>
                        <button className="btn btn-outline" onClick={() => setModal("edit")}>
                            <Pencil className="size-4" /> Edit
                        </button>
                        <button
                            className="btn btn-outline"
                            disabled={updating}
                            onClick={() =>
                                update(
                                    { id: job._id, isOpen: !job.isOpen },
                                    { onSuccess: () => toast.success(job.isOpen ? "Job closed" : "Job reopened") }
                                )
                            }
                        >
                            {job.isOpen ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                            {job.isOpen ? "Close job" : "Reopen"}
                        </button>
                        <button className="btn btn-ghost text-error" onClick={() => setModal("delete")}>
                            <Trash2 className="size-4" /> Delete
                        </button>
                    </>
                ) : (
                    <>
                        {job.myApplication ? (
                            <>
                                <span className="btn btn-disabled">
                                    Applied · {status?.label}
                                </span>
                                {job.myApplication.status === "submitted" && (
                                    <button className="btn btn-ghost" onClick={() => setModal("withdraw")}>
                                        Withdraw
                                    </button>
                                )}
                            </>
                        ) : job.isOpen ? (
                            <button className="btn btn-primary px-6" onClick={() => setModal("apply")}>
                                Easy Apply
                            </button>
                        ) : (
                            <span className="btn btn-disabled">No longer accepting applications</span>
                        )}
                        <button className="btn btn-outline btn-primary" onClick={() => toggleSave(job._id)}>
                            {job.isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                            {job.isSaved ? "Saved" : "Save"}
                        </button>
                    </>
                )}
            </div>

            {job.skills?.length > 0 && (
                <section className="mt-6">
                    <h2 className="font-semibold mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                            <span key={skill} className="badge badge-outline">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-6">
                <h2 className="text-lg font-semibold mb-2">About the job</h2>
                <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </section>

            {job.postedBy && !job.isOwner && (
                <section className="mt-6 rounded-box border border-base-300 p-4">
                    <h2 className="font-semibold mb-3">Meet the hiring team</h2>
                    <div className="flex items-center gap-3">
                        <Avatar user={job.postedBy} size="md" link />
                        <div className="min-w-0 flex-1">
                            <Link to={`/profile/${job.postedBy.username}`} className="font-semibold hover:underline">
                                {job.postedBy.name}
                            </Link>
                            <p className="text-xs text-muted line-clamp-1">{job.postedBy.headline}</p>
                            <p className="text-xs text-muted">Job poster</p>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => startConversation.mutate(job.postedBy._id)}>
                            <MessageSquareText className="size-4" /> Message
                        </button>
                    </div>
                </section>
            )}

            {modal === "apply" && <ApplyModal job={job} open onClose={() => setModal(null)} />}
            {modal === "edit" && <JobFormModal job={job} open onClose={() => setModal(null)} />}
            <ConfirmDialog
                open={modal === "delete"}
                onClose={() => setModal(null)}
                title="Delete this job?"
                message="Applicants will no longer be able to see it. This can't be undone."
                loading={deleting}
                onConfirm={() =>
                    remove(job._id, {
                        onSuccess: () => {
                            toast.success("Job deleted");
                            setModal(null);
                            if (onDeleted) onDeleted();
                            else navigate("/jobs");
                        },
                    })
                }
            />
            <ConfirmDialog
                open={modal === "withdraw"}
                onClose={() => setModal(null)}
                title="Withdraw application?"
                message="You can apply again later while the job is open."
                confirmLabel="Withdraw"
                loading={withdrawing}
                onConfirm={() => withdraw(job._id, { onSuccess: () => setModal(null) })}
            />
        </article>
    );
};

export default JobDetail;
