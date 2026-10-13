import { submissions } from "@/lib/data";

export default function SubmissionsPage() {
  return (
    <main className="container-shell py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">History</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Submission history</h1>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          "Problem",
          "Language",
          "Verdict",
          "Date",
        ].map((label) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {submissions.map((submission) => (
          <div key={submission.id} className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{submission.id}</div>
              <div className="text-lg font-semibold text-white">{submission.problem}</div>
            </div>
            <div className="text-sm text-slate-300">{submission.language}</div>
            <div className="text-sm font-medium text-cyan-300">{submission.verdict}</div>
            <div className="text-sm text-slate-400">{submission.time} • {submission.memory}</div>
            <div className="text-sm text-slate-400">{submission.date}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
