import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">404</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-slate-300">This problem or resource could not be located.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Return home</Link>
      </div>
    </main>
  );
}
