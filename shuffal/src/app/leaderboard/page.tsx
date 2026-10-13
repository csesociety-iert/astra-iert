import { leaderboard } from "@/lib/data";

export default function LeaderboardPage() {
  return (
    <main className="container-shell py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Rankings</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Society leaderboard</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Solved</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.name} className="border-t border-slate-800">
                <td className="px-4 py-4 font-semibold text-cyan-300">#{entry.rank}</td>
                <td className="px-4 py-4 text-white">{entry.name}</td>
                <td className="px-4 py-4">{entry.solved}</td>
                <td className="px-4 py-4">{entry.points}</td>
                <td className="px-4 py-4">{entry.streak} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
