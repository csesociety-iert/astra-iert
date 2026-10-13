import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Problem } from "@/lib/data";

const difficultyClasses: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  Medium: "bg-amber-500/15 text-white ring-1 ring-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
};

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30 transition hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">{problem.id}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClasses[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-white">{problem.title}</h3>
      <p className="mb-4 text-sm leading-6 text-slate-300">{problem.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-[11px] uppercase tracking-wide text-slate-300">
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
        <span>{problem.topic}</span>
        <span>{problem.acceptance}% acceptance</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200">{problem.status}</span>
        <Link href={`/problems/${problem.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
          Solve now
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
