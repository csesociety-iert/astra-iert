import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList, MessageSquareText, NotebookPen, Sparkles } from "lucide-react";
import { CodeWorkspace } from "@/components/code-workspace";
import { PortalShell } from "@/components/portal-shell";
import { problems } from "@/lib/data";

export default async function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = problems.find((entry) => entry.slug === slug);

  if (!problem) {
    notFound();
  }

  const problemIndex = problems.findIndex((entry) => entry.slug === problem.slug);
  const previousProblem = problems[problemIndex - 1];
  const nextProblem = problems[problemIndex + 1];

  return (
    <PortalShell>
      <main className="container-shell portal-content problem-solving-page">
        <div className="problem-solving-toolbar">
          <div className="problem-breadcrumb">
            <Link href="/problems"><ArrowLeft size={15} aria-hidden="true" /> Problem list</Link>
            <span className="problem-breadcrumb-separator">/</span>
            <span>{problem.id}</span>
          </div>
          <div className="problem-navigation-controls" aria-label="Problem navigation">
            {previousProblem ? (
              <Link href={`/problems/${previousProblem.slug}`} aria-label="Previous problem" title={previousProblem.title}>
                <ArrowLeft size={16} />
              </Link>
            ) : <span aria-disabled="true" title="No previous problem"><ArrowLeft size={16} /></span>}
            <Link href="/problems" aria-label="All problems" title="Problem list"><ClipboardList size={16} /></Link>
            {nextProblem ? (
              <Link href={`/problems/${nextProblem.slug}`} aria-label="Next problem" title={nextProblem.title}>
                <ArrowRight size={16} />
              </Link>
            ) : <span aria-disabled="true" title="No next problem"><ArrowRight size={16} /></span>}
          </div>
        </div>

        <div className="problem-solving-layout">
          <section className="problem-details-panel" aria-labelledby="problem-title">
            <div className="problem-details-tabs" aria-label="Problem sections">
              <span className="is-active"><Sparkles size={15} aria-hidden="true" /> Description</span>
              <Link href="/submissions"><ClipboardList size={15} aria-hidden="true" /> Submissions</Link>
              <button type="button" disabled title="Solutions are coming soon">
                <Sparkles size={15} aria-hidden="true" /> Solutions
              </button>
              <button type="button" disabled title="Discussion is coming soon">
                <MessageSquareText size={15} aria-hidden="true" /> Discussion
              </button>
              <button type="button" disabled title="Notes are coming soon">
                <NotebookPen size={15} aria-hidden="true" /> Notes
              </button>
            </div>
            <div className="problem-details-content">
              <div className="problem-title-row">
                <div>
                  <div className="problem-id-label">{problem.id}</div>
                  <h1 id="problem-title">{problem.title}</h1>
                </div>
                <span className={`problem-difficulty is-${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="problem-topic-tags">
                {problem.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="problem-description-block">
                <h2>Problem statement</h2>
                <p>{problem.description}</p>
              </div>
              <div className="problem-description-block">
                <h3>Input</h3>
                <p>{problem.inputFormat ?? "Input array and target value."}</p>
              </div>
              <div className="problem-description-block">
                <h3>Output</h3>
                <p>{problem.outputFormat ?? "Return the indices of the two numbers that add up to the target."}</p>
              </div>
              {problem.sampleInput !== undefined && problem.sampleOutput !== undefined && (
                <div className="problem-example-card">
                  <h3>Example 1</h3>
                  <p><strong>Input:</strong> <code>{problem.sampleInput}</code></p>
                  <p><strong>Output:</strong> <code>{problem.sampleOutput}</code></p>
                </div>
              )}
              <div className="problem-constraints-card">
                <h3>Constraints</h3>
                <p>{problem.constraints ?? "2 ≤ nums.length ≤ 10^4"}</p>
              </div>
            </div>
          </section>

          <CodeWorkspace
            problemSlug={problem.slug}
            starterCode={problem.starterCode}
            sampleInput={problem.sampleInput}
            sampleOutput={problem.sampleOutput}
          />
        </div>
      </main>
    </PortalShell>
  );
}
