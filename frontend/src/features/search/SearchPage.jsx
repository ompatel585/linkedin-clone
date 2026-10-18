import { Link, useNavigate, useSearchParams } from "react-router";
import { Hash, SearchX } from "lucide-react";
import { Card, EmptyState, ErrorState, ListSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cn, formatCount } from "../../lib/utils";
import PostCard from "../feed/components/PostCard";
import JobCard from "../jobs/components/JobCard";
import PersonRow from "../network/components/PersonRow";
import { useSearch } from "./api";

const TYPES = { all: "All", people: "People", posts: "Posts", jobs: "Jobs", hashtags: "Hashtags" };

const Section = ({ title, children, more }) => (
    <Card>
        <h2 className="font-semibold px-4 pt-4 pb-2">{title}</h2>
        {children}
        {more && (
            <button className="btn btn-ghost btn-sm w-full rounded-t-none border-t border-base-300 text-muted" onClick={more}>
                See all {title.toLowerCase()}
            </button>
        )}
    </Card>
);

const SearchPage = () => {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const q = params.get("q") ?? "";
    const type = TYPES[params.get("type")] ? params.get("type") : "all";
    useDocumentTitle(q ? `${q} - Search` : "Search");

    const { data, isPending, isError, error, refetch } = useSearch(q, type);
    const setType = (next) => setParams({ q, ...(next === "all" ? {} : { type: next }) });
    const show = (name) => type === "all" || type === name;
    const total = data ? data.people.length + data.posts.length + data.jobs.length + data.hashtags.length : 0;

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            <Card className="p-3 flex gap-2 overflow-x-auto">
                {Object.entries(TYPES).map(([id, label]) => (
                    <button
                        key={id}
                        className={cn("btn btn-sm shrink-0", type === id ? "btn-success text-success-content" : "btn-ghost border-base-300")}
                        onClick={() => setType(id)}
                    >
                        {label}
                    </button>
                ))}
            </Card>

            {!q ? (
                <Card>
                    <EmptyState icon={SearchX} title="Search UnLinked" description="Find people, posts, jobs and hashtags using the search bar." />
                </Card>
            ) : isPending ? (
                <Card>
                    <ListSkeleton />
                </Card>
            ) : isError ? (
                <ErrorState error={error} onRetry={refetch} />
            ) : !total ? (
                <Card>
                    <EmptyState icon={SearchX} title={`No results for “${q}”`} description="Try a different spelling or a more general term." />
                </Card>
            ) : (
                <>
                    {show("people") && data.people.length > 0 && (
                        <Section title="People" more={type === "all" ? () => setType("people") : undefined}>
                            <ul className="divide-y divide-base-300">
                                {data.people.map((person) => (
                                    <li key={person._id} className="px-4 py-3">
                                        <PersonRow person={person} />
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}
                    {show("hashtags") && data.hashtags.length > 0 && (
                        <Section title="Hashtags" more={type === "all" ? () => setType("hashtags") : undefined}>
                            <div className="flex flex-wrap gap-2 px-4 pb-4">
                                {data.hashtags.map(({ tag, count }) => (
                                    <Link key={tag} to={`/hashtag/${tag}`} className="btn btn-outline btn-sm">
                                        <Hash className="size-4" />
                                        {tag}
                                        <span className="text-muted font-normal">{formatCount(count)}</span>
                                    </Link>
                                ))}
                            </div>
                        </Section>
                    )}
                    {show("jobs") && data.jobs.length > 0 && (
                        <Section title="Jobs" more={type === "all" ? () => setType("jobs") : undefined}>
                            <div className="divide-y divide-base-300">
                                {data.jobs.map((job) => (
                                    <JobCard key={job._id} job={job} onSelect={() => navigate(`/jobs/${job._id}`)} />
                                ))}
                            </div>
                        </Section>
                    )}
                    {show("posts") && data.posts.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-semibold px-4 sm:px-1 pt-2">Posts</h2>
                            {data.posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                            {type === "all" && (
                                <button className="btn btn-ghost btn-sm w-full" onClick={() => setType("posts")}>
                                    See all posts
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;
