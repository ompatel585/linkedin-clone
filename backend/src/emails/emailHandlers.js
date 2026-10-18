import { isMailerConfigured, mailtrapClient, sender } from "../config/mailer.js";
import {
    createCommentNotificationEmailTemplate,
    createConnectionAcceptedEmailTemplate,
    createWelcomeEmailTemplate,
} from "./emailTemplates.js";

const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// Emails are best-effort: they never fail the request that triggered them.
const send = async ({ to, subject, html, category }) => {
    if (!isMailerConfigured) return;
    try {
        await mailtrapClient.send({ from: sender, to: [{ email: to }], subject, html, category });
    } catch (error) {
        console.error(`Failed to send "${category}" email:`, error.message);
    }
};

export const sendWelcomeEmail = (email, name, profileUrl) =>
    send({
        to: email,
        subject: "Welcome to UnLinked",
        html: createWelcomeEmailTemplate(escapeHtml(name), profileUrl),
        category: "welcome",
    });

export const sendCommentNotificationEmail = (recipientEmail, recipientName, commenterName, postUrl, commentContent) =>
    send({
        to: recipientEmail,
        subject: "New comment on your post",
        html: createCommentNotificationEmailTemplate(
            escapeHtml(recipientName),
            escapeHtml(commenterName),
            postUrl,
            escapeHtml(commentContent)
        ),
        category: "comment_notification",
    });

export const sendConnectionAcceptedEmail = (senderEmail, senderName, recipientName, profileUrl) =>
    send({
        to: senderEmail,
        subject: `${recipientName} accepted your connection request`,
        html: createConnectionAcceptedEmailTemplate(escapeHtml(senderName), escapeHtml(recipientName), profileUrl),
        category: "connection_accepted",
    });
