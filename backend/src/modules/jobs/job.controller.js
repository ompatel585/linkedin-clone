import Job from "../../models/job.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, escapeRegex, idEquals, parseLimit, parsePage } from "../../utils/query.js";
import { notify } from "../notifications/notification.service.js";

const FILTER_FIELDS = ["employmentType", "workplaceType", "experienceLevel"];

// Shapes a job for the viewer: never leaks other applicants to non-owners.
const serializeJob = (job, viewer) => {
    const json = job.toJSON ? job.toJSON() : job;
    const applications = json.applications || [];
    const isOwner = idEquals(json.postedBy?._id ?? json.postedBy, viewer._id);
    const myApplication = applications.find((a) => idEquals(a.user?._id ?? a.user, viewer._id));

    delete json.applications;
    return {
        ...json,
        applicantCount: applications.length,
        isOwner,
        isSaved: viewer.savedJobs.some((id) => idEquals(id, json._id)),
        myApplication: myApplication
            ? { _id: myApplication._id, status: myApplication.status, createdAt: myApplication.createdAt }
            : null,
    };
};

const findJobOrThrow = async (id) => {
    assertObjectId(id, "job id");
    const job = await Job.findById(id);
    if (!job) throw ApiError.notFound("Job not found");
    return job;
};

const findOwnJobOrThrow = async (id, userId) => {
    const job = await findJobOrThrow(id);
    if (!idEquals(job.postedBy, userId)) throw ApiError.forbidden("Only the job poster can do this");
    return job;
};

const withoutUndefined = (object) => Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined));

export const listJobs = async (req, res) => {
    const { q, location } = req.query;
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit, 10, 30);

    const filter = { isOpen: true };
    if (q) {
        const regex = new RegExp(escapeRegex(String(q).trim()), "i");
        filter.$or = [{ title: regex }, { company: regex }, { skills: regex }, { description: regex }];
    }
    if (location) filter.location = new RegExp(escapeRegex(String(location).trim()), "i");
    for (const field of FILTER_FIELDS) {
        if (req.query[field]) filter[field] = String(req.query[field]);
    }

    const [jobs, total] = await Promise.all([
        Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-applications.coverLetter -applications.resumeUrl")
            .populate("postedBy", USER_PREVIEW),
        Job.countDocuments(filter),
    ]);

    res.json({
        items: jobs.map((job) => serializeJob(job, req.user)),
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
};

export const createJob = async (req, res) => {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    await job.populate("postedBy", USER_PREVIEW);
    res.status(201).json(serializeJob(job, req.user));
};

export const getJob = async (req, res) => {
    const job = await findJobOrThrow(req.params.id);
    await job.populate("postedBy", USER_PREVIEW);
    res.json(serializeJob(job, req.user));
};

export const updateJob = async (req, res) => {
    const job = await findOwnJobOrThrow(req.params.id, req.user._id);
    job.set(withoutUndefined(req.body));
    await job.save();
    await job.populate("postedBy", USER_PREVIEW);
    res.json(serializeJob(job, req.user));
};

export const deleteJob = async (req, res) => {
    const job = await findOwnJobOrThrow(req.params.id, req.user._id);
    await job.deleteOne();
    await User.updateMany({ savedJobs: job._id }, { $pull: { savedJobs: job._id } });
    res.json({ message: "Job deleted" });
};

export const applyToJob = async (req, res) => {
    const job = await findJobOrThrow(req.params.id);
    const me = req.user;

    if (idEquals(job.postedBy, me._id)) throw ApiError.badRequest("You can't apply to your own job");
    if (!job.isOpen) throw ApiError.badRequest("This job is no longer accepting applications");
    if (job.applications.some((a) => idEquals(a.user, me._id))) throw ApiError.conflict("You already applied");

    job.applications.push({ user: me._id, ...req.body });
    await job.save();
    await notify({ recipient: job.postedBy, type: "jobApplication", relatedUser: me._id, relatedJob: job._id });

    await job.populate("postedBy", USER_PREVIEW);
    res.status(201).json(serializeJob(job, me));
};

export const withdrawApplication = async (req, res) => {
    const job = await findJobOrThrow(req.params.id);
    const before = job.applications.length;
    job.applications = job.applications.filter((a) => !idEquals(a.user, req.user._id));
    if (job.applications.length === before) throw ApiError.notFound("You haven't applied to this job");
    await job.save();
    await job.populate("postedBy", USER_PREVIEW);
    res.json(serializeJob(job, req.user));
};

export const toggleSaveJob = async (req, res) => {
    const job = await findJobOrThrow(req.params.id);
    const isSaved = req.user.savedJobs.some((id) => idEquals(id, job._id));
    await User.updateOne(
        { _id: req.user._id },
        isSaved ? { $pull: { savedJobs: job._id } } : { $addToSet: { savedJobs: job._id } }
    );
    res.json({ saved: !isSaved });
};

export const getSavedJobs = async (req, res) => {
    const me = await User.findById(req.user._id).select("savedJobs");
    const jobs = await Job.find({ _id: { $in: me.savedJobs } })
        .sort({ createdAt: -1 })
        .populate("postedBy", USER_PREVIEW);
    res.json(jobs.map((job) => serializeJob(job, req.user)));
};

export const getMyPostedJobs = async (req, res) => {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).populate("postedBy", USER_PREVIEW);
    res.json(jobs.map((job) => serializeJob(job, req.user)));
};

export const getAppliedJobs = async (req, res) => {
    const jobs = await Job.find({ "applications.user": req.user._id })
        .sort({ createdAt: -1 })
        .populate("postedBy", USER_PREVIEW);
    res.json(jobs.map((job) => serializeJob(job, req.user)));
};

export const getApplicants = async (req, res) => {
    const job = await findOwnJobOrThrow(req.params.id, req.user._id);
    await job.populate("applications.user", `${USER_PREVIEW} location skills`);
    res.json([...job.applications].reverse());
};

export const updateApplicationStatus = async (req, res) => {
    const job = await findOwnJobOrThrow(req.params.id, req.user._id);
    const application = job.applications.id(req.params.applicationId);
    if (!application) throw ApiError.notFound("Application not found");

    application.status = req.body.status;
    await job.save();
    await notify({
        recipient: application.user,
        type: "applicationUpdate",
        relatedUser: req.user._id,
        relatedJob: job._id,
        meta: application.status,
    });

    await job.populate("applications.user", `${USER_PREVIEW} location skills`);
    res.json(job.applications.id(application._id));
};
