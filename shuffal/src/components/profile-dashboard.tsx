"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, Code2, History, Medal, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { contests, featuredProblems, leaderboard, submissions } from "@/lib/data";
import { DashboardTopbar } from "@/components/dashboard-topbar";

type UserProfile = {
  id: string;
  account_type: "member" | "outsider";
  email: string;
  first_name: string;
  last_name: string;
  society_id?: string;
  avatar_url?: string | null;
};

export function ProfileDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [welcomeToast, setWelcomeToast] = useState("");

  useEffect(() => {
    const firstName = sessionStorage.getItem("astra-welcome-name");
    if (firstName === null) return;
    sessionStorage.removeItem("astra-welcome-name");
    let dismissTimeout: number | undefined;
    const showTimeout = window.setTimeout(() => {
      setWelcomeToast(firstName || "there");
      dismissTimeout = window.setTimeout(() => setWelcomeToast(""), 5000);
    });
    return () => {
      window.clearTimeout(showTimeout);
      if (dismissTimeout !== undefined) window.clearTimeout(dismissTimeout);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await apiRequest<{ user: UserProfile }>("/api/profile/me");
    setProfile(result.user);
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(refreshProfile)
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.message.includes("sign in")) {
          router.replace("/");
          return;
        }
        setError(cause instanceof Error ? cause.message : "Could not load your profile.");
      })
      .finally(() => setLoading(false));
  }, [refreshProfile, router]);

  async function signOut() {
    setError("");
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  if (loading) {
    return <main className="dashboard-loading">Loading your profile…</main>;
  }
  if (!profile) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-load-error">
          <p role="alert">{error || "Could not load your profile."}</p>
          <Link href="/">Return to sign in</Link>
        </div>
      </main>
    );
  }

  const isOutsider = profile.account_type === "outsider";
  return (
    <div className="profile-dashboard">
      {welcomeToast && (
        <div className="welcome-toast" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span><strong>Welcome back, {welcomeToast}!</strong><small>Your ASTRA workspace is ready.</small></span>
          <button type="button" onClick={() => setWelcomeToast("")} aria-label="Dismiss welcome message">
            <X size={16} />
          </button>
        </div>
      )}
      <DashboardTopbar
        name={[profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email}
        accountType={isOutsider ? "Outsider account" : "Society member"}
        avatarUrl={profile.avatar_url}
        activeHome
        onSignOut={signOut}
      />

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">CSE SOCIETY · IERT PRAYAGRAJ</p>
          <h1>Take control of your <span>coding future.</span></h1>
          <p className="dashboard-intro">
            Master data structures, algorithms, and problem solving with your ASTRA coding workspace.
          </p>
          <div className="dashboard-hero-actions">
            <Link href="/problems" className="dashboard-primary-action">Start solving <ArrowUpRight size={16} /></Link>
            <Link href="/contests" className="dashboard-secondary-action">Explore contests</Link>
            <a
              href="/courses/rohit-negi-dsa-gen-ai-courses.pdf"
              className="dashboard-secondary-action"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen size={16} /> DSA &amp; Gen AI course PDF
            </a>
          </div>
          {profile.society_id && <span className="member-id-chip">Society ID · {profile.society_id}</span>}
        </section>
        {error && <p className="dashboard-message error" role="alert">{error}</p>}

        <section className="dashboard-code-preview" aria-label="ASTRA coding workspace preview">
          <div className="dashboard-editor-toolbar">
            <span className="dashboard-window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="dashboard-editor-tab"><Code2 size={13} /> solution.py <i /></span>
            <span className="dashboard-editor-ready">SAVED</span>
            <Link href="/submissions" className="dashboard-submit-button">Submit</Link>
            <Link href={`/problems/${featuredProblems[0].slug}`} className="dashboard-run-button">
              <Code2 size={14} /> Run Code
            </Link>
          </div>
          <div className="dashboard-editor-body">
            <div className="dashboard-editor-main">
              <div className="dashboard-code-lines" aria-label="Example Python solution">
                <span><i>1</i><code><b>def</b> solve(nums, target):</code></span>
                <span><i>2</i><code>    seen = {"{}"}</code></span>
                <span><i>3</i><code>    <b>for</b> index, value <b>in</b> enumerate(nums):</code></span>
                <span><i>4</i><code>        complement = target - value</code></span>
                <span><i>5</i><code>        <b>if</b> complement <b>in</b> seen:</code></span>
                <span><i>6</i><code>            <b>return</b> [seen[complement], index]</code></span>
                <span><i>7</i><code>        seen[value] = index</code></span>
                <span><i>8</i><code>    <b>return</b> []</code></span>
              </div>
              <div className="dashboard-terminal">
                <div className="dashboard-terminal-heading">
                  <span><i /> TERMINAL</span>
                  <span>›_</span>
                </div>
                <p>Welcome to ASTRA Terminal! <b>»</b></p>
                <span className="dashboard-terminal-prompt">› <i /></span>
              </div>
            </div>
            <aside className="dashboard-editor-aside" aria-label="Code suggestions">
              <div className="dashboard-editor-aside-tabs">
                <span>All Submissions</span>
                <span>Bug Details</span>
              </div>
              <p className="dashboard-editor-aside-title">CODE SUGGESTIONS</p>
              {[
                ["Refactor solution", "Extract repeated logic into reusable helpers for clearer readability."],
                ["Add input validation", "Validate the input before processing."],
                ["Improve spacing", "Use consistent spacing and formatting."],
                ["Implement error handling", "Handle unexpected values and edge cases gracefully."],
                ["Add loading states", "Show feedback while the code is running."],
                ["Optimize re-renders", "Keep the interface responsive and efficient."],
              ].map(([title, description]) => (
                <article className="dashboard-suggestion-card" key={title}>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </article>
              ))}
            </aside>
          </div>
        </section>

        <section className="dashboard-overview" aria-labelledby="workspace-heading">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">ASTRA WORKSPACE</p>
              <h2 id="workspace-heading">Your next step starts here</h2>
            </div>
            <Link href="/problems" className="dashboard-view-all">
              Browse all problems <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Code2 size={17} /></span>
              <div><strong>{featuredProblems.length}</strong><span>Featured problems</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Trophy size={17} /></span>
              <div><strong>{contests.length}</strong><span>Contest listings</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><History size={17} /></span>
              <div><strong>{submissions.length}</strong><span>Recent sample submissions</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Medal size={17} /></span>
              <div><strong>{leaderboard.length}</strong><span>Leaderboard entries</span></div>
            </article>
          </div>

          <div className="dashboard-content-grid">
            <section className="dashboard-content-card" aria-labelledby="featured-heading">
              <div className="dashboard-card-heading">
                <div>
                  <p className="dashboard-eyebrow">PICK A CHALLENGE</p>
                  <h3 id="featured-heading">Featured problems</h3>
                </div>
                <Link href="/problems" aria-label="View all problems"><ArrowUpRight size={17} /></Link>
              </div>
              <div className="dashboard-problem-list">
                {featuredProblems.map((problem) => (
                  <Link key={problem.slug} href={`/problems/${problem.slug}`} className="dashboard-problem-row">
                    <span><strong>{problem.title}</strong><small>{problem.id} · {problem.topic}</small></span>
                    <span className={`dashboard-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="dashboard-content-card" aria-labelledby="contests-heading">
              <div className="dashboard-card-heading">
                <div>
                  <p className="dashboard-eyebrow">COMING UP</p>
                  <h3 id="contests-heading">Contests</h3>
                </div>
                <Link href="/contests" aria-label="View all contests"><ArrowUpRight size={17} /></Link>
              </div>
              <div className="dashboard-contest-list">
                {contests.slice(0, 2).map((contest) => (
                  <div key={contest.title} className="dashboard-contest-row">
                    <span className="dashboard-contest-mark"><Trophy size={15} /></span>
                    <span><strong>{contest.title}</strong><small>{contest.date} · {contest.duration}</small></span>
                    <span className="dashboard-contest-status">{contest.status}</span>
                  </div>
                ))}
              </div>
              <Link href="/contests" className="dashboard-subtle-link">Explore all contests <ArrowUpRight size={14} /></Link>
            </section>
          </div>
        </section>

      </main>
    </div>
  );
}
