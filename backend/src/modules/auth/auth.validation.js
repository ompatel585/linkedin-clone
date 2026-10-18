import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters")
        .max(30)
        .regex(/^[a-z0-9_.-]+$/, "Username can only contain letters, numbers, dots, dashes and underscores"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const loginSchema = z.object({
    // Accepts either a username or an email address
    username: z.string().trim().toLowerCase().min(1, "Username or email is required"),
    password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(128),
});
