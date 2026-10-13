export default function AdminPage() {
  return (
    <main className="container-shell py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Administration</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Admin controls</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["Members", "Review approvals and roles"],
          ["Problems", "Publish and archive challenges"],
          ["Contests", "Manage scheduling and standings"],
        ].map(([title, text]) => (
          <div key={title} className="panel p-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm text-slate-300">{text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
