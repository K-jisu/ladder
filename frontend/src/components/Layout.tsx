import { NavLink, Outlet } from "react-router";

const TABS = [
    { to: "/ladder", label: "사다리타기" },
    { to: "/roulette", label: "룰렛" },
];

export default function Layout() {
    return (
        <div
            className="min-h-dvh flex flex-col items-center bg-[#0d0f17]"
            style={{
                background:
                    "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%), #0d0f17",
            }}
        >
            {/* Header */}
            <header className="w-full max-w-4xl flex items-center justify-between px-8 pt-7">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                    뽑기
                </span>

                {/* Tab nav */}
                <nav className="flex gap-1 p-1 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    {TABS.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            className={({ isActive }) =>
                                [
                                    "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                                    isActive
                                        ? "bg-violet-400/15 text-violet-300"
                                        : "text-slate-500 hover:text-slate-300",
                                ].join(" ")
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <Outlet />
        </div>
    );
}
