"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { PortalShell } from "@/components/portal-shell";

type Submission = {
  id: string;
  problem_slug: string;
  problem_title: string;
  language: string;
  verdict: string;
  failed_test_case: number | null;
  created_at: string;
};

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<{ recent_submissions: Submission[] }>("/api/profile/stats")
      .then(({ recent_submissions: recent }) => {
        if (active) setSubmissions(recent);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load submission history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortalShell>
      <main className="container-shell portal-content py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">History</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Submission history</h1>
          <p className="mt-2 text-sm text-slate-400">Latest judged attempts from your account.</p>
        </div>

        {loading ? (
          <div className="panel p-6 text-sm text-slate-300" role="status">Loading your submissions…</div>
        ) : error ? (
          <div className="panel p-6 text-sm text-rose-300" role="alert">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="panel grid justify-items-center gap-3 p-10 text-center">
            <p className="text-sm text-slate-300">No judged submissions have been recorded yet.</p>
            <Link className="text-sm text-cyan-300 hover:text-cyan-200" href="/problems">Explore problems</Link>
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <div className="submission-history-header">
              <span>Status</span>
              <span>Problem</span>
              <span>Language</span>
              <span>Submitted</span>
            </div>
            {submissions.map((submission) => (
              <div className="submission-history-row" key={submission.id}>
                <span className={`profile-submission-verdict${submission.verdict === "Accepted" ? " is-accepted" : ""}`}>
                  <i />{submission.verdict}
                  {submission.failed_test_case && ` · Test ${submission.failed_test_case}`}
                </span>
                <Link href={`/problems/${submission.problem_slug}`}>{submission.problem_title}</Link>
                <span>{submission.language}</span>
                <time dateTime={submission.created_at}>{formatSubmittedAt(submission.created_at)}</time>
              </div>
            ))}
          </div>
        )}
      </main>
    </PortalShell>
  );
}
