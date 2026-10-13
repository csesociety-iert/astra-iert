"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

type ExecutionResult = {
  status_id: number;
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  exit_code: number | null;
};

const pythonStarter = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`;

export function CodeWorkspace({
  starterCode = pythonStarter,
  sampleInput = "",
  sampleOutput = "[0, 1]",
}: {
  starterCode?: string;
  sampleInput?: string;
  sampleOutput?: string;
}) {
  const [sourceCode, setSourceCode] = useState(starterCode);
  const [stdin, setStdin] = useState(sampleInput);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);

  async function handleRunCode() {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const execution = await apiRequest<ExecutionResult>("/api/judge/execute", {
        method: "POST",
        body: JSON.stringify({
          language_id: "Python 3",
          source_code: sourceCode,
          stdin,
        }),
      });
      setResult(execution);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not run code.");
    } finally {
      setRunning(false);
    }
  }

  const output = result?.compile_output || result?.stderr || result?.stdout;

  return (
    <aside className="panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Workspace</h2>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">Python</span>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          Input
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            className="mt-2 h-20 w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 font-mono text-sm text-slate-100 outline-none"
            spellCheck={false}
            aria-label="Program input"
          />
        </label>
        <textarea
          value={sourceCode}
          onChange={(event) => setSourceCode(event.target.value)}
          className="h-72 w-full rounded-xl border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none ring-0"
          spellCheck={false}
        />
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            type="button"
            onClick={handleRunCode}
            disabled={running}
            aria-busy={running}
          >
            {running ? "Running…" : "Run code"}
          </button>
          <button className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950" type="button">
            Submit
          </button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300" aria-live="polite">
          {error ? (
            <span role="alert">{error}</span>
          ) : result ? (
            <div className="space-y-2">
              <p>
                {result.status}:{" "}
                <span className="text-cyan-300">
                  {output || (result.status_id === 3 ? "Program finished without output." : result.status)}
                </span>
              </p>
              {(result.time !== null || result.memory !== null) && (
                <p className="text-xs text-slate-400">
                  {result.time !== null ? `Time: ${result.time}s` : ""}
                  {result.time !== null && result.memory !== null ? " · " : ""}
                  {result.memory !== null ? `Memory: ${result.memory} KB` : ""}
                </p>
              )}
            </div>
          ) : (
              <>Sample output: <span className="text-cyan-300">{sampleOutput}</span></>
          )}
        </div>
      </div>
    </aside>
  );
}
