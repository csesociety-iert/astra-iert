import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { problems } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function DailyPracticePage() {
  const today = new Date();
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(today).map(({ type, value }) => [type, value]),
  );
  const year = Number(dateParts.year);
  const month = Number(dateParts.month);
  const day = Number(dateParts.day);
  const todayUtc = Date.UTC(year, month - 1, day);
  const firstDayOfYear = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((todayUtc - firstDayOfYear) / 86_400_000);
  const problem = problems[dayOfYear % problems.length];
  const dateLabel = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(today);
  const dateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <PortalShell>
      <main className="container-shell portal-content daily-practice-page">
        <header className="daily-practice-heading">
          <p className="daily-practice-eyebrow"><CalendarDays size={15} aria-hidden="true" /> DAILY PRACTICE</p>
          <h1>Your daily challenge.</h1>
          <p>Build a steady problem-solving habit with one focused question every day.</p>
        </header>

        <div className="daily-practice-layout">
          <article className="daily-practice-card">
            <div className="daily-practice-card-top">
              <span><Sparkles size={15} aria-hidden="true" /> Problem of the day</span>
              <time dateTime={dateTime}>{dateLabel}</time>
            </div>
            <div className="daily-practice-problem-id">{problem.id}</div>
            <div className="daily-practice-title-row">
              <h2>{problem.title}</h2>
              <span className={`daily-practice-difficulty is-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            </div>
            <p className="daily-practice-description">{problem.description}</p>
            <div className="daily-practice-tags">
              {problem.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="daily-practice-meta">
              <span><Clock3 size={15} aria-hidden="true" /> Take your time and reason it through</span>
              <span>{problem.topic}</span>
            </div>
            <Link className="daily-practice-start" href={`/problems/${problem.slug}`}>
              Solve today&apos;s problem <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </article>

          <aside className="daily-practice-side">
            <div className="daily-practice-tip">
              <span className="daily-practice-tip-icon"><CheckCircle2 size={20} aria-hidden="true" /></span>
              <h2>Make it count</h2>
              <p>Try the problem before looking up a solution. Explain your approach, test edge cases, and then submit your code.</p>
            </div>
            <div className="daily-practice-library">
              <span>Need another challenge?</span>
              <strong>Explore the full question library.</strong>
              <Link href="/problems">Browse questions <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </aside>
        </div>
      </main>
    </PortalShell>
  );
}
