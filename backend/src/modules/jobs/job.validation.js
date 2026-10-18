import { z } from "zod";
import {
    APPLICATION_STATUSES,
    EMPLOYMENT_TYPES,
    EXPERIENCE_LEVELS,
    WORKPLACE_TYPES,
} from "../../models/job.model.js";

const salary = z.coerce.number().int().min(0).max(100_000_000).optional().nullable().catch(null);

const jobFields = {
    title: z.string().trim().min(2, "Title is required").max(120),
    company: z.string().trim().min(1, "Company is required").max(120),
    location: z.string().trim().max(120).optional().default(""),
    workplaceType: z.enum(WORKPLACE_TYPES).default("onsite"),
    employmentType: z.enum(EMPLOYMENT_TYPES).default("full-time"),
    experienceLevel: z.enum(EXPERIENCE_LEVELS).default("mid"),
    description: z.string().trim().min(20, "Description must be at least 20 characters").max(10000),
    skills: z.array(z.string().trim().min(1).max(50)).max(30).optional().default([]),
    salaryMin: salary,
    salaryMax: salary,
};

const salaryRange = (data) => !data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax;

export const createJobSchema = z
    .object(jobFields)
    .refine(salaryRange, { message: "Minimum salary can't exceed maximum salary", path: ["salaryMin"] });

export const updateJobSchema = z
    .object({
        ...Object.fromEntries(Object.entries(jobFields).map(([key, schema]) => [key, schema.optional()])),
        isOpen: z.boolean().optional(),
    })
    .refine(salaryRange, { message: "Minimum salary can't exceed maximum salary", path: ["salaryMin"] });

export const applySchema = z.object({
    coverLetter: z.string().trim().max(3000).optional().default(""),
    resumeUrl: z
        .string()
        .trim()
        .max(500)
        .refine((value) => !value || /^https?:\/\//.test(value), "Resume link must start with http(s)://")
        .optional()
        .default(""),
});

export const applicationStatusSchema = z.object({
    status: z.enum(APPLICATION_STATUSES),
});
