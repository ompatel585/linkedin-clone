import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../../../components/ui/Modal";
import { SelectInput, TextArea, TextInput } from "../../../components/ui/FormField";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, WORKPLACE_TYPES } from "../../../lib/constants";
import { useCreateJob, useUpdateJob } from "../api";

const EMPTY = {
    title: "",
    company: "",
    location: "",
    workplaceType: "onsite",
    employmentType: "full-time",
    experienceLevel: "mid",
    description: "",
    skills: "",
    salaryMin: "",
    salaryMax: "",
};

const toForm = (job) =>
    job
        ? { ...EMPTY, ...job, skills: job.skills.join(", "), salaryMin: job.salaryMin ?? "", salaryMax: job.salaryMax ?? "" }
        : EMPTY;

const JobFormModal = ({ job, open, onClose, onSaved }) => {
    const [form, setForm] = useState(() => toForm(job));
    const create = useCreateJob();
    const update = useUpdateJob();
    const mutation = job ? update : create;
    const errors = Object.fromEntries((mutation.error?.response?.data?.details || []).map((d) => [d.path, d.message]));

    const bind = (field) => ({ value: form[field], onChange: (e) => setForm((prev) => ({ ...prev, [field]: e.target.value })) });

    const submit = () => {
        const payload = {
            title: form.title,
            company: form.company,
            location: form.location,
            workplaceType: form.workplaceType,
            employmentType: form.employmentType,
            experienceLevel: form.experienceLevel,
            description: form.description,
            skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
            salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
        };
        mutation.mutate(job ? { id: job._id, ...payload } : payload, {
            onSuccess: (saved) => {
                toast.success(job ? "Job updated" : "Job posted");
                onSaved?.(saved);
                onClose();
            },
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={job ? "Edit job" : "Post a job"}
            size="lg"
            footer={
                <button className="btn btn-primary" onClick={submit} disabled={mutation.isPending}>
                    {mutation.isPending && <span className="loading loading-spinner loading-sm" />}
                    {job ? "Save changes" : "Post job"}
                </button>
            }
        >
            <div className="grid sm:grid-cols-2 gap-x-4">
                <TextInput label="Job title *" {...bind("title")} error={errors.title} placeholder="Ex: Frontend Engineer" />
                <TextInput label="Company *" {...bind("company")} error={errors.company} />
                <TextInput label="Location" {...bind("location")} placeholder="City, Country" />
                <SelectInput label="Workplace" options={WORKPLACE_TYPES} {...bind("workplaceType")} />
                <SelectInput label="Employment type" options={EMPLOYMENT_TYPES} {...bind("employmentType")} />
                <SelectInput label="Experience level" options={EXPERIENCE_LEVELS} {...bind("experienceLevel")} />
                <TextInput label="Salary from (USD / year)" type="number" min={0} {...bind("salaryMin")} error={errors.salaryMin} />
                <TextInput label="Salary to (USD / year)" type="number" min={0} {...bind("salaryMax")} />
            </div>
            <TextInput label="Skills" {...bind("skills")} hint="Comma separated, e.g. React, Node.js, SQL" />
            <TextArea
                label="Description *"
                {...bind("description")}
                error={errors.description}
                rows={8}
                maxLength={10000}
                placeholder="What will this person do? What are you looking for?"
            />
        </Modal>
    );
};

export default JobFormModal;
