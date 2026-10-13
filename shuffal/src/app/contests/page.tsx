import { contests } from "@/lib/data";
import { PortalShell } from "@/components/portal-shell";

export default function ContestsPage() {
  return (
    <PortalShell>
    <main className="container-shell portal-content py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Competition</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Contests</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {contests.map((contest) => (
          <div key={contest.title} className="panel p-6">
            <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
              {contest.status}
            </div>
            <h2 className="text-2xl font-semibold text-white">{contest.title}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Date: {contest.date}</p>
              <p>Duration: {contest.duration}</p>
            </div>
            <button className="mt-5 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white">Register</button>
          </div>
        ))}
      </div>
    </main>
    </PortalShell>
  );
}
