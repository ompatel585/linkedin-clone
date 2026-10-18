import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Bookmark, BriefcaseBusiness, ChevronDown, LogOut, MessageSquareText, Moon, Search, Settings, Sun, UserRound, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import Menu from "../ui/Menu";
import SearchBar from "../../features/search/SearchBar";
import { useCurrentUser } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { useLogout } from "../../features/auth/api";
import CountBadge from "./CountBadge";
import { NAV_ITEMS, useNavCounts } from "./navigation";
import { cn } from "../../lib/utils";

const Navbar = () => {
    const user = useCurrentUser();
    const counts = useNavCounts();
    const { resolved, setPreference } = useTheme();
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();
    const [mobileSearch, setMobileSearch] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-3">
                {mobileSearch ? (
                    <>
                        <SearchBar className="flex-1" onNavigate={() => setMobileSearch(false)} />
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setMobileSearch(false)} aria-label="Close search">
                            <X className="size-5" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/" className="shrink-0" aria-label="UnLinked home">
                            <img src="/logo-mark.svg" alt="UnLinked" className="size-9 rounded" />
                        </Link>
                        <SearchBar className="hidden sm:block w-64 lg:w-72" />

                        <nav className="ml-auto flex items-center">
                            {NAV_ITEMS.map(({ to, label, icon: Icon, end, count }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        cn(
                                            "hidden md:flex flex-col items-center gap-0.5 px-3 lg:px-4 h-14 justify-center text-xs border-b-2 transition-colors",
                                            isActive
                                                ? "border-base-content text-base-content"
                                                : "border-transparent text-muted hover:text-base-content"
                                        )
                                    }
                                >
                                    <span className="relative">
                                        <Icon className="size-6" />
                                        <CountBadge count={counts[count]} />
                                    </span>
                                    <span className="hidden lg:block">{label}</span>
                                </NavLink>
                            ))}

                            <button
                                className="btn btn-ghost btn-circle btn-sm sm:hidden"
                                onClick={() => setMobileSearch(true)}
                                aria-label="Search"
                            >
                                <Search className="size-5" />
                            </button>
                            <Link to="/messaging" className="btn btn-ghost btn-circle btn-sm md:hidden relative" aria-label="Messaging">
                                <MessageSquareText className="size-5" />
                                <CountBadge count={counts.messages} className="left-auto right-0 -top-1" />
                            </Link>

                            <Menu
                                className="ml-1 md:border-l md:border-base-300 md:pl-3"
                                trigger={({ toggle }) => (
                                    <button onClick={toggle} className="flex flex-col items-center text-xs text-muted hover:text-base-content" aria-label="Account menu">
                                        <Avatar user={user} size="xs" />
                                        <span className="hidden lg:flex items-center">
                                            Me <ChevronDown className="size-3.5" />
                                        </span>
                                    </button>
                                )}
                                items={[
                                    { label: "View profile", icon: UserRound, onClick: () => navigate(`/profile/${user.username}`) },
                                    { label: "Saved posts", icon: Bookmark, onClick: () => navigate("/saved") },
                                    { label: "My jobs", icon: BriefcaseBusiness, onClick: () => navigate("/jobs/my") },
                                    {
                                        label: resolved === "dark" ? "Light mode" : "Dark mode",
                                        icon: resolved === "dark" ? Sun : Moon,
                                        onClick: () => setPreference(resolved === "dark" ? "light" : "dark"),
                                    },
                                    { label: "Settings", icon: Settings, onClick: () => navigate("/settings") },
                                    { label: "Sign out", icon: LogOut, onClick: () => logout(), danger: true },
                                ]}
                            />
                        </nav>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
