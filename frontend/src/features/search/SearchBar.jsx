import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { Briefcase, Hash, Search } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/utils";
import { useSearch } from "./api";

const SearchBar = ({ className, onNavigate }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const debounced = useDebounce(query.trim(), 250);
    const navigate = useNavigate();
    const close = useCallback(() => setOpen(false), []);
    const ref = useClickOutside(close, open);

    const { data, isFetching } = useSearch(debounced, "all", 4);

    const go = (path) => {
        setOpen(false);
        setQuery("");
        onNavigate?.();
        navigate(path);
    };

    const submit = (event) => {
        event.preventDefault();
        if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const hasResults = data && (data.people.length || data.jobs.length || data.hashtags.length);

    return (
        <form ref={ref} onSubmit={submit} className={cn("relative", className)} role="search">
            <label className="input input-sm w-full bg-base-200 border-transparent focus-within:bg-base-100 focus-within:border-primary">
                <Search className="size-4 opacity-60" />
                <input
                    type="search"
                    placeholder="Search people, posts, jobs"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    aria-label="Search"
                />
                {isFetching && <span className="loading loading-spinner loading-xs" />}
            </label>

            {open && debounced && (
                <div className="absolute left-0 right-0 mt-1 z-40 card-surface shadow-xl p-2 animate-pop max-h-[70vh] overflow-y-auto min-w-72">
                    {hasResults ? (
                        <ul className="menu w-full p-0">
                            {data.people.map((person) => (
                                <li key={person._id}>
                                    <button type="button" onClick={() => go(`/profile/${person.username}`)} className="flex gap-3">
                                        <Avatar user={person} size="xs" />
                                        <span className="min-w-0 text-left">
                                            <span className="block font-medium truncate">{person.name}</span>
                                            <span className="block text-xs text-muted truncate">{person.headline}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                            {data.hashtags.map(({ tag, count }) => (
                                <li key={tag}>
                                    <button type="button" onClick={() => go(`/hashtag/${tag}`)} className="flex gap-3">
                                        <Hash className="size-4" />#{tag}
                                        <span className="ml-auto text-xs text-muted">{count} posts</span>
                                    </button>
                                </li>
                            ))}
                            {data.jobs.map((job) => (
                                <li key={job._id}>
                                    <button type="button" onClick={() => go(`/jobs/${job._id}`)} className="flex gap-3">
                                        <Briefcase className="size-4" />
                                        <span className="truncate">
                                            {job.title} · <span className="text-muted">{job.company}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !isFetching && <p className="px-3 py-2 text-sm text-muted">No quick matches</p>
                    )}
                    <button type="submit" className="btn btn-ghost btn-sm w-full mt-1 text-primary">
                        See all results for “{debounced}”
                    </button>
                </div>
            )}
        </form>
    );
};

export default SearchBar;
