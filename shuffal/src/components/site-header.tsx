import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/problems", label: "Practice" },
  { href: "/contests", label: "Contests" },
  { href: "/submissions", label: "Submissions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl">
      <div className="site-header-inner mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="site-header-icon flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-300">
            <Code2 size={20} />
          </div>
          <div>
            <div className="site-header-wordmark text-lg font-semibold tracking-[0.18em] text-white">ASTRA</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">IERT</div>
          </div>
        </Link>

        <nav className="site-header-nav flex items-center gap-6 text-sm text-slate-300">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-cyan-300">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="site-header-cta hidden items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 md:inline-flex"
          >
            Start Coding
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
