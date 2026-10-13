import { env } from "../config/env.js";

const maxPollAttempts = 10;
const pollDelaysMs = [500, 750, 1_125, 1_688, 2_531, 3_797, 4_000, 4_000, 4_000];

const languageIds: Record<string, number> = {
  "50": 50,
  "54": 54,
  "62": 62,
  "63": 63,
  "71": 71,
  c: 50,
  "c (gcc)": 50,
  "c11": 50,
  "c++": 54,
  cpp: 54,
  "c++17": 54,
  "cpp17": 54,
  "c++ (gcc 9.2.0)": 54,
  java: 62,
  "java 17": 62,
  "java (openjdk 13.0.1)": 62,
  javascript: 63,
  js: 63,
  node: 63,
  "node.js": 63,
  "javascript (node.js 12.14.0)": 63,
  python: 71,
  python3: 71,
  "python 3": 71,
  "python 3.8": 71,
  "python (3.8.1)": 71,
};

export class Judge0ServiceError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "Judge0ServiceError";
  }
}

export type Judge0ExecutionResult = {
  status_id: number;
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  exit_code: number | null;
};

type Judge0Response = {
  token?: unknown;
  status?: { id?: unknown; description?: unknown };
  stdout?: unknown;
  stderr?: unknown;
  compile_output?: unknown;
  time?: unknown;
  memory?: unknown;
  exit_code?: unknown;
};

export function languageIdFor(language: string | number): number {
  const key = String(language).trim().toLowerCase().replace(/\s+/g, " ");
  const languageId = Object.hasOwn(languageIds, key) ? languageIds[key] : undefined;
  if (!languageId) {
    throw new Judge0ServiceError("Choose a language supported by the code runner.", 400);
  }
  return languageId;
}

export function encodeJudge0Text(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

export function decodeJudge0Text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new Judge0ServiceError("Judge0 returned invalid encoded output.", 502);
  }
  return Buffer.from(value, "base64").toString("utf8");
}

function judge0BaseUrl() {
  if (!env.JUDGE0_API_URL) {
    throw new Judge0ServiceError(
      "Code execution is not configured. Set JUDGE0_API_URL in the backend environment.",
      503,
    );
  }
  return env.JUDGE0_API_URL.replace(/\/+$/, "");
}

function judge0Headers(baseUrl: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const hostname = new URL(baseUrl).hostname;
  if (env.JUDGE0_API_KEY) {
    headers.set(env.JUDGE0_AUTH_HEADER || "X-Auth-Token", env.JUDGE0_API_KEY);
  }
  if (hostname.endsWith(".rapidapi.com")) {
    headers.set("X-RapidAPI-Host", hostname);
  }
  return headers;
}

async function requestJudge0(url: string, init: RequestInit): Promise<Judge0Response> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    if (init.signal?.aborted) {
      throw new Judge0ServiceError("Code execution timed out. Try again.", 504);
    }
    throw new Judge0ServiceError("Could not connect to Judge0. Check the backend endpoint.", 502);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Judge0ServiceError("Judge0 is rate-limiting requests. Try again shortly.", 429);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Judge0ServiceError("Judge0 rejected its configured credentials. Check the backend settings.", 503);
    }
    if (response.status >= 500) {
      throw new Judge0ServiceError("Judge0 is temporarily unavailable. Try again shortly.", 502);
    }
    throw new Judge0ServiceError("Judge0 rejected the execution request.", 400);
  }

  try {
    return await response.json() as Judge0Response;
  } catch {
    throw new Judge0ServiceError("Judge0 returned an invalid response.", 502);
  }
}

function normalizeResult(result: Judge0Response): Judge0ExecutionResult {
  const statusId = result.status?.id;
  const status = result.status?.description;
  if (typeof statusId !== "number" || typeof status !== "string") {
    throw new Judge0ServiceError("Judge0 returned an invalid execution status.", 502);
  }
  if (statusId === 1 || statusId === 2) {
    throw new Judge0ServiceError("Judge0 execution did not finish before the polling limit.", 504);
  }
  return {
    status_id: statusId,
    status,
    stdout: decodeJudge0Text(result.stdout),
    stderr: decodeJudge0Text(result.stderr),
    compile_output: decodeJudge0Text(result.compile_output),
    time: typeof result.time === "string" ? result.time : null,
    memory: typeof result.memory === "number" ? result.memory : null,
    exit_code: typeof result.exit_code === "number" ? result.exit_code : null,
  };
}

export async function submitCode(input: {
  language: string | number;
  sourceCode: string;
  stdin: string;
  signal: AbortSignal;
}): Promise<string> {
  const baseUrl = judge0BaseUrl();
  const result = await requestJudge0(
    `${baseUrl}/submissions?base64_encoded=true&wait=false`,
    {
      method: "POST",
      headers: judge0Headers(baseUrl),
      signal: input.signal,
      body: JSON.stringify({
        language_id: languageIdFor(input.language),
        source_code: encodeJudge0Text(input.sourceCode),
        stdin: encodeJudge0Text(input.stdin),
      }),
    },
  );
  if (typeof result.token !== "string" || result.token.length === 0) {
    throw new Judge0ServiceError("Judge0 did not return an execution token.", 502);
  }
  return result.token;
}

export async function pollExecution(
  token: string,
  signal: AbortSignal,
): Promise<Judge0ExecutionResult> {
  const baseUrl = judge0BaseUrl();
  const headers = judge0Headers(baseUrl);

  for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, pollDelaysMs[attempt] ?? 4_000));
    const result = await requestJudge0(
      `${baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=true`,
      { headers, signal },
    );
    const statusId = result.status?.id;
    if (typeof statusId !== "number" || (statusId !== 1 && statusId !== 2)) {
      return normalizeResult(result);
    }
  }

  throw new Judge0ServiceError("Judge0 execution did not finish before the polling limit.", 504);
}

export async function executeCode(input: {
  language: string | number;
  sourceCode: string;
  stdin: string;
  signal: AbortSignal;
}): Promise<Judge0ExecutionResult> {
  const token = await submitCode(input);
  return pollExecution(token, input.signal);
}
