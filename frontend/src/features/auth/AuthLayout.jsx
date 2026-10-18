import { Link } from "react-router";
import { BriefcaseBusiness, MessageSquareText, Users } from "lucide-react";

const HIGHLIGHTS = [
    { icon: Users, text: "Grow your professional network" },
    { icon: MessageSquareText, text: "Chat in real time with your connections" },
    { icon: BriefcaseBusiness, text: "Discover jobs and apply in a click" },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="min-h-dvh bg-base-100 flex flex-col">
        <header className="px-6 py-4 max-w-6xl w-full mx-auto">
            <Link to="/" className="inline-flex">
                <img src="/logo.svg" alt="UnLinked" className="h-8" />
            </Link>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-10 grid lg:grid-cols-2 gap-12 items-center">
            <section className="hidden lg:block">
                <h1 className="text-5xl font-light leading-tight text-primary">
                    Welcome to your professional community
                </h1>
                <ul className="mt-10 space-y-5">
                    {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-4 text-lg">
                            <span className="size-11 rounded-full bg-secondary text-secondary-content grid place-items-center">
                                <Icon className="size-5" />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
                <div className="card-surface shadow-sm p-6 sm:p-8">
                    <h2 className="text-3xl font-semibold">{title}</h2>
                    {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
                {footer && <div className="text-center mt-6">{footer}</div>}
            </section>
        </main>
    </div>
);

export default AuthLayout;
