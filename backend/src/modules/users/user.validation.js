import { z } from "zod";

const optionalDate = z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((value) => (value ? new Date(value) : null))
    .refine((value) => value === null || !Number.isNaN(value.getTime()), "Invalid date");

const optionalYear = z.coerce.number().int().min(1900).max(2100).optional().nullable().catch(null);

const experienceItem = z.object({
    title: z.string().trim().min(1, "Title is required").max(100),
    company: z.string().trim().min(1, "Company is required").max(100),
    location: z.string().trim().max(100).optional().default(""),
    startDate: optionalDate,
    endDate: optionalDate,
    description: z.string().trim().max(2000).optional().default(""),
});

const educationItem = z.object({
    school: z.string().trim().min(1, "School is required").max(150),
    degree: z.string().trim().max(100).optional().default(""),
    fieldOfStudy: z.string().trim().max(100).optional().default(""),
    startYear: optionalYear,
    endYear: optionalYear,
});

export const updateProfileSchema = z
    .object({
        name: z.string().trim().min(2).max(60),
        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(3)
            .max(30)
            .regex(/^[a-z0-9_.-]+$/, "Username can only contain letters, numbers, dots, dashes and underscores"),
        headline: z.string().trim().max(220),
        about: z.string().trim().max(2600),
        location: z.string().trim().max(100),
        website: z.string().trim().max(200),
        openToWork: z.boolean(),
        profilePicture: z.string(),
        bannerImage: z.string(),
        skills: z.array(z.string().trim().min(1).max(50)).max(50),
        experience: z.array(experienceItem).max(30),
        education: z.array(educationItem).max(20),
    })
    .partial()
    .strict();
