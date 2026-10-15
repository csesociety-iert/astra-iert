"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Check, Clipboard, CloudUpload, FlaskConical, Play, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/api";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="problem-editor-loading">Loading editor…</div>,
});

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

type SubmissionResult = {
  accepted: boolean;
  verdict: string;
  failed_test_case?: number;
  current_streak?: number;
};

type TestCase = {
  label: string;
  input: string;
  expected: string;
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
  problemSlug,
  starterCode = pythonStarter,
  sampleInput = "",
  sampleOutput = "[0, 1]",
  judgeable = false,
}: {
  problemSlug: string;
  starterCode?: string;
  sampleInput?: string;
  sampleOutput?: string;
  judgeable?: boolean;
}) {
  const [sourceCode, setSourceCode] = useState(starterCode);
  const [testCases, setTestCases] = useState<TestCase[]>(() => [
    { label: "Case 1", input: sampleInput, expected: sampleOutput },
    ...(problemSlug === "longest-substring-without-repeating-characters"
      ? [{ label: "Case 2", input: "bbbbb", expected: "1" }]
      : []),
  ]);
  const [activeCase, setActiveCase] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const canSubmit = judgeable || problemSlug === "longest-substring-without-repeating-characters";
  const selectedCase = testCases[activeCase] ?? testCases[0];

  function clearResults() {
    setResult(null);
    setSubmissionResult(null);
    setError("");
  }

  function updateCaseInput(value: string) {
    setTestCases((cases) => cases.map((testCase, index) =>
      index === activeCase ? { ...testCase, input: value } : testCase,
    ));
    clearResults();
  }

  async function handleRunCode() {
    setRunning(true);
    clearResults();
    try {
      const execution = await apiRequest<ExecutionResult>("/api/judge/execute", {
        method: "POST",
        body: JSON.stringify({
          language_id: "Python 3",
          source_code: sourceCode,
          stdin: selectedCase.input,
        }),
      });
      setResult(execution);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not run code.");
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    clearResults();
    try {
      const submitted = await apiRequest<SubmissionResult>("/api/judge/submit", {
        method: "POST",
        body: JSON.stringify({
          problem_slug: problemSlug,
          language_id: "Python 3",
          source_code: sourceCode,
        }),
      });
      setSubmissionResult(submitted);
      if (submitted.accepted) {
        window.dispatchEvent(new Event("astra:streak-updated"));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit your solution.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy code to the clipboard.");
    }
  }

  function handleRestoreStarter() {
    setSourceCode(starterCode);
    clearResults();
  }

  const output = result?.compile_output || result?.stderr || result?.stdout;

  return (
    <section className="problem-console" aria-label="Code editor and test cases">
      <div className="problem-console-toolbar">
        <div className="problem-console-language" aria-label="Selected language">
          <span className="problem-language-dot" />
          Python 3
          <span className="problem-language-chevron" aria-hidden="true">⌄</span>
        </div>
        <div className="problem-console-actions">
          <button
            className="problem-run-button"
            type="button"
            onClick={handleRunCode}
            disabled={running || submitting}
            aria-busy={running}
          >
            <Play size={15} aria-hidden="true" />
            {running ? "Running…" : "Run"}
          </button>
          <button
            className="problem-submit-button"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || running || !canSubmit}
            aria-busy={submitting}
            title={!canSubmit ? "Judging is not available for this problem yet." : undefined}
          >
            <CloudUpload size={16} aria-hidden="true" />
            {submitting ? "Submitting…" : canSubmit ? "Submit" : "Unavailable"}
          </button>
        </div>
      </div>

      <div className="problem-editor-toolbar">
        <div><span className="problem-editor-file-icon">{"</>"}</span> solution.py</div>
        <div className="problem-editor-tools">
          <span className="problem-editor-status"><span /> Editor ready</span>
          <button type="button" onClick={handleCopyCode} aria-label="Copy code" title="Copy code">
            {copied ? <Check size={15} /> : <Clipboard size={15} />}
          </button>
          <button type="button" onClick={handleRestoreStarter} aria-label="Restore starter code" title="Restore starter code">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <div className="problem-editor">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={sourceCode}
          onChange={(value) => {
            setSourceCode(value ?? "");
            clearResults();
          }}
          options={{
            automaticLayout: true,
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: 14,
            lineNumbers: "on",
            minimap: { enabled: false },
            padding: { top: 18, bottom: 18 },
            readOnly: running || submitting,
            scrollBeyondLastLine: false,
            tabSize: 4,
            wordWrap: "on",
          }}
        />
      </div>

      <section className="problem-test-panel" aria-label="Test cases and results">
        <div className="problem-test-panel-heading">
          <div className="problem-test-panel-title">
            <FlaskConical size={15} aria-hidden="true" />
            <span>Test cases</span>
          </div>
          {error && <span className="problem-result-error" role="alert">{error}</span>}
          {canSubmit && !error && (
            <span className="problem-test-count">{testCases.length} sample case{testCases.length === 1 ? "" : "s"}</span>
          )}
        </div>
        <div className="problem-test-case-tabs" role="tablist" aria-label="Test cases">
          {testCases.map((testCase, index) => (
            <button
              key={testCase.label}
              id={`test-case-tab-${index}`}
              className={activeCase === index ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeCase === index}
              aria-controls="problem-test-case-content"
              onClick={() => {
                setActiveCase(index);
                clearResults();
              }}
            >
              {testCase.label}
            </button>
          ))}
        </div>
        <div
          className="problem-test-case-content"
          id="problem-test-case-content"
          role="tabpanel"
          aria-labelledby={`test-case-tab-${activeCase}`}
        >
          <label>
            <span>Input</span>
            <textarea
              value={selectedCase.input}
              onChange={(event) => updateCaseInput(event.target.value)}
              spellCheck={false}
              aria-label="Test case input"
            />
          </label>
          <label>
            <span>Expected output</span>
            <textarea
              value={selectedCase.expected}
              readOnly
              spellCheck={false}
              aria-label="Expected output"
            />
          </label>
        </div>
        {(submissionResult || result || error) && (
          <div className="problem-test-result" aria-live="polite">
            {submissionResult ? (
              <div className={submissionResult.accepted ? "is-accepted" : "is-rejected"} role="status">
                <strong>{submissionResult.verdict}</strong>
                {submissionResult.failed_test_case && (
                  <span> on test case {submissionResult.failed_test_case}.</span>
                )}
                {submissionResult.accepted && submissionResult.current_streak !== undefined && (
                  <span>
                    {" "}Your current streak: {submissionResult.current_streak}{" "}
                    {submissionResult.current_streak === 1 ? "day" : "days"}.
                  </span>
                )}
              </div>
            ) : result ? (
              <div className={result.status_id === 3 ? "is-accepted" : "is-rejected"} role="status">
                <strong>{result.status}</strong>
                <pre>{output || (result.status_id === 3 ? "Program finished without output." : result.status)}</pre>
                {(result.time !== null || result.memory !== null) && (
                  <small>
                    {result.time !== null ? `Time: ${result.time}s` : ""}
                    {result.time !== null && result.memory !== null ? " · " : ""}
                    {result.memory !== null ? `Memory: ${result.memory} KB` : ""}
                  </small>
                )}
              </div>
            ) : null}
          </div>
        )}
        {!canSubmit && (
          <p className="problem-judging-note">
            Only accepted submissions count toward your streak. Test-case judging is not enabled for this problem yet.
          </p>
        )}
      </section>
    </section>
  );
}
