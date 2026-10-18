import { NavLink } from "react-router";
import { cn } from "../../lib/utils";
import CountBadge from "./CountBadge";
import { NAV_ITEMS, useNavCounts } from "./navigation";

// Bottom tab bar for small screens (messaging lives in the top bar there).
const MobileNav = () => {
    const counts = useNavCounts();
    const items = NAV_ITEMS.filter((item) => item.to !== "/messaging");

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-base-100 border-t border-base-300 pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-4">
                {items.map(({ to, label, icon: Icon, end, count }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center gap-0.5 py-2 text-[11px]",
                                isActive ? "text-base-content font-medium" : "text-muted"
                            )
                        }
                    >
                        <span className="relative">
                            <Icon className="size-6" />
                            <CountBadge count={counts[count]} />
                        </span>
                        {label.replace("My ", "")}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default MobileNav;
