import { MailtrapClient } from "mailtrap";
import { env } from "./env.js";

export const isMailerConfigured = Boolean(env.mail.token && env.mail.from);

export const mailtrapClient = isMailerConfigured ? new MailtrapClient({ token: env.mail.token }) : null;

export const sender = {
    email: env.mail.from,
    name: env.mail.fromName,
};
