import { useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, GraduationCap, Pencil, Plus, Trash2, X } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Card } from "../../../components/ui/Feedback";
import { TextArea, TextInput } from "../../../components/ui/FormField";
import { formatMonthYear } from "../../../lib/utils";
import { useUpdateProfile } from "../api";

const SectionHeader = ({ title, onAdd, onEdit }) => (
    <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-1">
            {onAdd && (
                <button className="btn btn-ghost btn-circle btn-sm" onClick={onAdd} aria-label={`Add ${title.toLowerCase()}`}>
                    <Plus className="size-5" />
                </button>
            )}
            {onEdit && (
                <button className="btn btn-ghost btn-circle btn-sm" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
                    <Pencil className="size-4" />
                </button>
            )}
        </div>
    </div>
);

const SaveFooter = ({ onSave, isPending, onDelete }) => (
    <>
        {onDelete && (
            <button className="btn btn-ghost text-error mr-auto" onClick={onDelete} disabled={isPending}>
                <Trash2 className="size-4" /> Delete
            </button>
        )}
        <button className="btn btn-primary" onClick={onSave} disabled={isPending}>
            {isPending && <span className="loading loading-spinner loading-sm" />}
            Save
        </button>
    </>
);

const useSave = (onDone) => {
    const { mutate, isPending } = useUpdateProfile();
    const save = (data, message = "Profile updated") =>
        mutate(data, {
            onSuccess: () => {
                toast.success(message);
                onDone();
            },
        });
    return { save, isPending };
};

// ---------- About ----------

export const AboutSection = ({ profile, isOwnProfile }) => {
    const [editing, setEditing] = useState(false);
    const [about, setAbout] = useState(profile.about);
    const [expanded, setExpanded] = useState(false);
    const { save, isPending } = useSave(() => setEditing(false));

    if (!profile.about && !isOwnProfile) return null;
    const long = profile.about.length > 300;

    return (
        <Card className="p-5">
            <SectionHeader title="About" onEdit={isOwnProfile ? () => (setAbout(profile.about), setEditing(true)) : undefined} />
            {profile.about ? (
                <p className="whitespace-pre-wrap break-words">
                    {long && !expanded ? `${profile.about.slice(0, 300)}…` : profile.about}
                    {long && (
                        <button className="text-muted hover:text-primary ml-1 font-medium" onClick={() => setExpanded((v) => !v)}>
                            {expanded ? "show less" : "see more"}
                        </button>
                    )}
                </p>
            ) : (
                <p className="text-muted text-sm">Tell people about your experience, skills and what you're looking for.</p>
            )}
            <Modal open={editing} onClose={() => setEditing(false)} title="Edit about" footer={<SaveFooter isPending={isPending} onSave={() => save({ about })} />}>
                <TextArea value={about} onChange={(e) => setAbout(e.target.value)} rows={8} maxLength={2600} hint={`${about.length}/2600`} />
            </Modal>
        </Card>
    );
};

// ---------- Experience ----------

const toMonth = (value) => (value ? new Date(value).toISOString().slice(0, 7) : "");
const fromMonth = (value) => (value ? `${value}-01` : null);
const EMPTY_EXPERIENCE = { title: "", company: "", location: "", startDate: "", endDate: "", description: "", current: false };

const ExperienceForm = ({ value, onChange }) => {
    const bind = (field) => ({ value: value[field], onChange: (e) => onChange({ ...value, [field]: e.target.value }) });
    return (
        <>
            <TextInput label="Title *" {...bind("title")} placeholder="Ex: Software Engineer" maxLength={100} />
            <TextInput label="Company *" {...bind("company")} placeholder="Ex: Microsoft" maxLength={100} />
            <TextInput label="Location" {...bind("location")} placeholder="Ex: London, UK" maxLength={100} />
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={value.current}
                    onChange={(e) => onChange({ ...value, current: e.target.checked, endDate: "" })}
                />
                I currently work here
            </label>
            <div className="grid grid-cols-2 gap-3">
                <TextInput label="Start date *" type="month" {...bind("startDate")} />
                <TextInput label="End date" type="month" {...bind("endDate")} disabled={value.current} />
            </div>
            <TextArea label="Description" {...bind("description")} rows={4} maxLength={2000} />
        </>
    );
};

export const ExperienceSection = ({ profile, isOwnProfile }) => {
    const [editing, setEditing] = useState(null); // { index, value } — index -1 for new
    const { save, isPending } = useSave(() => setEditing(null));
    const items = profile.experience;

    if (!items.length && !isOwnProfile) return null;

    const open = (index) => {
        const item = items[index];
        setEditing({
            index,
            value: item
                ? { ...EMPTY_EXPERIENCE, ...item, startDate: toMonth(item.startDate), endDate: toMonth(item.endDate), current: !item.endDate }
                : EMPTY_EXPERIENCE,
        });
    };

    const persist = (next) => save({ experience: next });

    const submit = () => {
        const { value, index } = editing;
        if (!value.title.trim() || !value.company.trim() || !value.startDate) return toast.error("Title, company and start date are required");
        const entry = { ...value, startDate: fromMonth(value.startDate), endDate: value.current ? null : fromMonth(value.endDate) };
        delete entry.current;
        const next = [...items];
        if (index === -1) next.unshift(entry);
        else next[index] = entry;
        persist(next);
    };

    return (
        <Card className="p-5">
            <SectionHeader title="Experience" onAdd={isOwnProfile ? () => open(-1) : undefined} />
            {!items.length && <p className="text-muted text-sm">Add your work experience to stand out.</p>}
            <ul className="divide-y divide-base-300">
                {items.map((exp, i) => (
                    <li key={exp._id ?? i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="size-12 rounded-md bg-base-200 grid place-items-center shrink-0">
                            <Briefcase className="size-6 text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{exp.title}</h3>
                            <p className="text-sm">{exp.company}</p>
                            <p className="text-sm text-muted">
                                {formatMonthYear(exp.startDate)} – {formatMonthYear(exp.endDate)}
                                {exp.location && ` · ${exp.location}`}
                            </p>
                            {exp.description && <p className="text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>}
                        </div>
                        {isOwnProfile && (
                            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => open(i)} aria-label="Edit experience">
                                <Pencil className="size-4" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <Modal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                title={editing?.index === -1 ? "Add experience" : "Edit experience"}
                footer={
                    <SaveFooter
                        isPending={isPending}
                        onSave={submit}
                        onDelete={editing?.index >= 0 ? () => persist(items.filter((_, i) => i !== editing.index)) : undefined}
                    />
                }
            >
                {editing && <ExperienceForm value={editing.value} onChange={(value) => setEditing((prev) => ({ ...prev, value }))} />}
            </Modal>
        </Card>
    );
};

// ---------- Education ----------

const EMPTY_EDUCATION = { school: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" };

export const EducationSection = ({ profile, isOwnProfile }) => {
    const [editing, setEditing] = useState(null);
    const { save, isPending } = useSave(() => setEditing(null));
    const items = profile.education;

    if (!items.length && !isOwnProfile) return null;

    const open = (index) =>
        setEditing({
            index,
            value: items[index]
                ? { ...EMPTY_EDUCATION, ...items[index], startYear: items[index].startYear ?? "", endYear: items[index].endYear ?? "" }
                : EMPTY_EDUCATION,
        });

    const bind = (field) => ({
        value: editing?.value[field] ?? "",
        onChange: (e) => setEditing((prev) => ({ ...prev, value: { ...prev.value, [field]: e.target.value } })),
    });

    const submit = () => {
        if (!editing.value.school.trim()) return toast.error("School is required");
        const next = [...items];
        if (editing.index === -1) next.unshift(editing.value);
        else next[editing.index] = editing.value;
        save({ education: next });
    };

    return (
        <Card className="p-5">
            <SectionHeader title="Education" onAdd={isOwnProfile ? () => open(-1) : undefined} />
            {!items.length && <p className="text-muted text-sm">Add your education.</p>}
            <ul className="divide-y divide-base-300">
                {items.map((edu, i) => (
                    <li key={edu._id ?? i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="size-12 rounded-md bg-base-200 grid place-items-center shrink-0">
                            <GraduationCap className="size-6 text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{edu.school}</h3>
                            <p className="text-sm">{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ")}</p>
                            {(edu.startYear || edu.endYear) && (
                                <p className="text-sm text-muted">
                                    {edu.startYear ?? "?"} – {edu.endYear ?? "Present"}
                                </p>
                            )}
                        </div>
                        {isOwnProfile && (
                            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => open(i)} aria-label="Edit education">
                                <Pencil className="size-4" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <Modal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                title={editing?.index === -1 ? "Add education" : "Edit education"}
                footer={
                    <SaveFooter
                        isPending={isPending}
                        onSave={submit}
                        onDelete={editing?.index >= 0 ? () => save({ education: items.filter((_, i) => i !== editing.index) }) : undefined}
                    />
                }
            >
                <TextInput label="School *" {...bind("school")} placeholder="Ex: Stanford University" maxLength={150} />
                <TextInput label="Degree" {...bind("degree")} placeholder="Ex: Bachelor's" maxLength={100} />
                <TextInput label="Field of study" {...bind("fieldOfStudy")} placeholder="Ex: Computer Science" maxLength={100} />
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Start year" type="number" min={1900} max={2100} {...bind("startYear")} />
                    <TextInput label="End year (or expected)" type="number" min={1900} max={2100} {...bind("endYear")} />
                </div>
            </Modal>
        </Card>
    );
};

// ---------- Skills ----------

export const SkillsSection = ({ profile, isOwnProfile }) => {
    const [editing, setEditing] = useState(false);
    const [skills, setSkills] = useState(profile.skills);
    const [draft, setDraft] = useState("");
    const { save, isPending } = useSave(() => setEditing(false));

    if (!profile.skills.length && !isOwnProfile) return null;

    const add = (e) => {
        e.preventDefault();
        const skill = draft.trim();
        if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase())) setSkills([...skills, skill]);
        setDraft("");
    };

    return (
        <Card className="p-5">
            <SectionHeader title="Skills" onEdit={isOwnProfile ? () => (setSkills(profile.skills), setEditing(true)) : undefined} />
            {profile.skills.length ? (
                <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                        <span key={skill} className="badge badge-lg bg-base-200 border-base-300">
                            {skill}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-muted text-sm">Show off what you're great at.</p>
            )}
            <Modal open={editing} onClose={() => setEditing(false)} title="Edit skills" footer={<SaveFooter isPending={isPending} onSave={() => save({ skills })} />}>
                <form onSubmit={add} className="flex gap-2">
                    <input className="input flex-1" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a skill and press Enter" maxLength={50} aria-label="New skill" />
                    <button type="submit" className="btn btn-outline" disabled={!draft.trim()}>
                        Add
                    </button>
                </form>
                <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((skill) => (
                        <span key={skill} className="badge badge-lg gap-1 bg-base-200 border-base-300">
                            {skill}
                            <button onClick={() => setSkills(skills.filter((s) => s !== skill))} aria-label={`Remove ${skill}`}>
                                <X className="size-3.5" />
                            </button>
                        </span>
                    ))}
                    {!skills.length && <p className="text-sm text-muted">No skills added yet.</p>}
                </div>
            </Modal>
        </Card>
    );
};
