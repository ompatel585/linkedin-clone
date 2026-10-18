import { useState } from "react";
import { Link } from "react-router";

const TOKEN = /(#[\p{L}\p{N}_]+|https?:\/\/[^\s]+)/gu;
const COLLAPSED_LENGTH = 280;

// Renders post text with clickable hashtags and links, collapsing long posts.
const PostContent = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return null;

    const isLong = text.length > COLLAPSED_LENGTH;
    const visible = isLong && !expanded ? `${text.slice(0, COLLAPSED_LENGTH).trimEnd()}…` : text;

    return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
            {visible.split(TOKEN).map((part, i) => {
                if (part.startsWith("#") && part.length > 1) {
                    return (
                        <Link key={i} to={`/hashtag/${part.slice(1).toLowerCase()}`} className="text-primary font-medium hover:underline">
                            {part}
                        </Link>
                    );
                }
                if (/^https?:\/\//.test(part)) {
                    return (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline break-all">
                            {part}
                        </a>
                    );
                }
                return part;
            })}
            {isLong && (
                <button className="text-muted hover:text-primary ml-1 font-medium" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? "show less" : "see more"}
                </button>
            )}
        </div>
    );
};

export default PostContent;
