import Link from "next/link";
import { notFound } from "next/navigation";
import { problems } from "@/lib/data";

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = { slug: "two-sum" };
  const problem = problems.find((entry) => entry.slug === slug);

  if (!problem) {
    notFound();
  }

  return (
    <main className="container-shell py-10">
      <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
        <Link href="/problems" className="text-cyan-300 hover:text-cyan-200">Problems</Link>
        <span>/</span>
        <span>{problem.id}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{problem.id}</div>
              <h1 className="mt-2 text-3xl font-bold text-white">{problem.title}</h1>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              {problem.difficulty}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-6 text-slate-300">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-white">Problem statement</h2>
              <p>{problem.description}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Input</h3>
              <p>Input array and target value.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Output</h3>
              <p>Return the indices of the two numbers that add up to the target.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Constraints</h3>
              <p>2 ≤ nums.length ≤ 10^4</p>
            </div>
          </div>
        </section>

        <aside className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Workspace</h2>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">Python</span>
          </div>

          <div className="space-y-4">
            <textarea
              value={`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`}
              className="h-72 w-full rounded-xl border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none ring-0"
            />
            <div className="flex gap-3">
              <button className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white">Run code</button>
              <button className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Submit</button>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              Sample output: <span className="text-cyan-300">[0, 1]</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
