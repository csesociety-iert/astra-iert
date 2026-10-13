import { PortalShell } from "@/components/portal-shell";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return (
    <PortalShell>
    <main className="container-shell portal-content py-10">
      <div className="panel p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-2xl font-bold text-white">
            A
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Profile</p>
            <h1 className="mt-2 text-4xl font-bold text-white">{username}</h1>
            <p className="mt-2 text-slate-300">Member ID: IERT-CS-1042 • 142 problems solved</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Solved", "142"],
            ["Acceptance", "71%"],
            ["Contests", "14"],
            ["Streak", "18 days"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
    </PortalShell>
  );
}
