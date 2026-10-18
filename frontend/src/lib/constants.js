export const REACTIONS = {
    like: { label: "Like", emoji: "👍", className: "text-primary" },
    celebrate: { label: "Celebrate", emoji: "👏", className: "text-success" },
    love: { label: "Love", emoji: "❤️", className: "text-error" },
    insightful: { label: "Insightful", emoji: "💡", className: "text-warning" },
    funny: { label: "Funny", emoji: "😄", className: "text-accent" },
};

export const REACTION_TYPES = Object.keys(REACTIONS);

export const EMPLOYMENT_TYPES = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    temporary: "Temporary",
};

export const WORKPLACE_TYPES = { onsite: "On-site", remote: "Remote", hybrid: "Hybrid" };

export const EXPERIENCE_LEVELS = { entry: "Entry level", mid: "Mid level", senior: "Senior", lead: "Lead / Manager" };

export const APPLICATION_STATUSES = {
    submitted: { label: "Submitted", badge: "badge-ghost" },
    reviewing: { label: "In review", badge: "badge-info" },
    interview: { label: "Interviewing", badge: "badge-warning" },
    rejected: { label: "Not selected", badge: "badge-error" },
    hired: { label: "Hired", badge: "badge-success" },
};
