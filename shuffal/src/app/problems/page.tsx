import { ProblemCard } from "@/components/problem-card";
import { PortalShell } from "@/components/portal-shell";
import { problems } from "@/lib/data";

export default function ProblemsPage() {
  return (
    <PortalShell>
    <main className="container-shell portal-content py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Problem library</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Search and solve</h1>
        </div>
        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          Search by title, ID, tag, or topic
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          "Difficulty",
          "Topic",
          "Status",
          "Sort by",
        ].map((filter) => (
          <div key={filter} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            {filter}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {problems.map((problem) => (
          <ProblemCard key={problem.slug} problem={problem} />
        ))}
      </div>
    </main>
    </PortalShell>
  );
}
