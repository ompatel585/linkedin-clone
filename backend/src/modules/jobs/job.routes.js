import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
    applyToJob,
    createJob,
    deleteJob,
    getApplicants,
    getAppliedJobs,
    getJob,
    getMyPostedJobs,
    getSavedJobs,
    listJobs,
    toggleSaveJob,
    updateApplicationStatus,
    updateJob,
    withdrawApplication,
} from "./job.controller.js";
import { applicationStatusSchema, applySchema, createJobSchema, updateJobSchema } from "./job.validation.js";

const router = Router();

router.use(protectRoute);

router.get("/", listJobs);
router.post("/", validateBody(createJobSchema), createJob);
router.get("/saved", getSavedJobs);
router.get("/mine", getMyPostedJobs);
router.get("/applied", getAppliedJobs);

router.get("/:id", getJob);
router.patch("/:id", validateBody(updateJobSchema), updateJob);
router.delete("/:id", deleteJob);
router.post("/:id/apply", validateBody(applySchema), applyToJob);
router.delete("/:id/apply", withdrawApplication);
router.post("/:id/save", toggleSaveJob);
router.get("/:id/applicants", getApplicants);
router.patch("/:id/applicants/:applicationId", validateBody(applicationStatusSchema), updateApplicationStatus);

export default router;
