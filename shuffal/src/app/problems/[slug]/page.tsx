import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeWorkspace } from "@/components/code-workspace";
import { PortalShell } from "@/components/portal-shell";
import { problems } from "@/lib/data";

export default async function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = problems.find((entry) => entry.slug === slug);

  if (!problem) {
    notFound();
  }

  return (
    <PortalShell>
    <main className="container-shell portal-content py-10">
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
              <p>{problem.inputFormat ?? "Input array and target value."}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Output</h3>
              <p>{problem.outputFormat ?? "Return the indices of the two numbers that add up to the target."}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Constraints</h3>
              <p>{problem.constraints ?? "2 ≤ nums.length ≤ 10^4"}</p>
            </div>
            {problem.sampleInput !== undefined && problem.sampleOutput !== undefined && (
              <div>
                <h3 className="mb-2 font-semibold text-white">Example</h3>
                <p>Input: <code className="text-cyan-300">{problem.sampleInput}</code></p>
                <p>Output: <code className="text-cyan-300">{problem.sampleOutput}</code></p>
              </div>
            )}
          </div>
        </section>

        <CodeWorkspace
          starterCode={problem.starterCode}
          sampleInput={problem.sampleInput}
          sampleOutput={problem.sampleOutput}
        />
      </div>
    </main>
    </PortalShell>
  );
}
