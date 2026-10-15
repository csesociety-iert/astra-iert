import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { executeCode, Judge0ServiceError } from "../services/judge0Service.js";
import { requireSession } from "../middleware/require-session.js";
import { getCurrentStreak } from "../lib/streak.js";
import { recordSubmission } from "../lib/submissions.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { isMissingStorageError, RequiredStorageError } from "../lib/storage-errors.js";

export const judgeRouter = Router();

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const executeSchema = z.object({
  language_id: z.union([
    z.string().trim().min(1).max(40),
    z.number().int(),
  ]),
  source_code: z.string().min(1).max(30_000).refine((source) => source.trim().length > 0),
  stdin: z.string().max(10_000).default(""),
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const submitSchema = z.object({
  problem_slug: z.string().trim().min(1).max(80),
  language_id: z.union([
    z.string().trim().min(1).max(40),
    z.number().int(),
  ]),
  source_code: z.string().min(1).max(30_000).refine((source) => source.trim().length > 0),
});

const legacyProblemSlug = "longest-substring-without-repeating-characters";
const legacyProblem = {
  test_cases: [
    { input: "abcabcbb\n", expected: "3" },
    { input: "bbbbb\n", expected: "1" },
    { input: "pwwkew\n", expected: "3" },
    { input: "abba\n", expected: "2" },
    { input: "dvdf\n", expected: "3" },
    { input: "\n", expected: "0" },
  ],
  problem_slug: "longest-substring-without-repeating-characters",
  problem_title: "Longest Substring Without Repeating Characters",
  difficulty: "Medium" as const,
  problem_tags: ["strings", "sliding-window"],
};

const storedTestCasesSchema = z.array(z.object({
  input: z.string().max(10_000),
  expected: z.string().max(10_000),
})).min(1).max(25);

function normalizeOutput(output: string | null) {
  return (output ?? "").replace(/\r\n/g, "\n").trim();
}

async function getProblemForSubmission(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("astra_problems")
    .select("problem_id,title,slug,difficulty,tags,test_cases")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    if (isMissingStorageError(error, "astra_problems")) {
      if (slug === legacyProblemSlug) return legacyProblem;
      throw new RequiredStorageError("Problem");
    }
    throw error;
  }

  if (!data) return slug === legacyProblemSlug ? legacyProblem : null;

  const testCases = storedTestCasesSchema.safeParse(data.test_cases);
  if (!testCases.success) {
    throw new Error(`Stored test cases are invalid for problem ${data.problem_id}.`);
  }
  return {
    test_cases: testCases.data,
    problem_slug: String(data.slug),
    problem_title: String(data.title),
    difficulty: data.difficulty as "Easy" | "Medium" | "Hard",
    problem_tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  };
}

judgeRouter.post("/execute", requireSession, executeLimiter, async (request, response) => {
  const parsed = executeSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Choose a supported language and provide valid code and input." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const result = await executeCode({
      language: parsed.data.language_id,
      sourceCode: parsed.data.source_code,
      stdin: parsed.data.stdin,
      signal: controller.signal,
    });
    response.json(result);
  } catch (error) {
    if (error instanceof Judge0ServiceError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("Judge0 execution failed:", error);
    response.status(502).json({ error: "Judge0 could not complete this execution request." });
  } finally {
    clearTimeout(timeout);
  }
});

judgeRouter.post("/submit", requireSession, submitLimiter, async (request, response, next) => {
  const parsed = submitSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: "Submissions are not enabled for this problem yet. Choose a problem with test-case judging.",
    });
    return;
  }

  const session = request.astraSession;
  if (!session) {
    response.status(401).json({ error: "Please sign in to submit a solution." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const problem = await getProblemForSubmission(parsed.data.problem_slug);
    if (!problem) {
      response.status(404).json({ error: "This question is not available for judging." });
      return;
    }

    const results = await Promise.all(
      problem.test_cases.map(async (testCase, index) => ({
        testCase: index + 1,
        expected: testCase.expected,
        result: await executeCode({
          language: parsed.data.language_id,
          sourceCode: parsed.data.source_code,
          stdin: testCase.input,
          signal: controller.signal,
        }),
      })),
    );

    const failedCase = results.find(({ expected, result }) =>
      result.status_id !== 3 ||
      normalizeOutput(result.stdout) !== normalizeOutput(expected),
    );
    const problemMetadata = {
      problem_slug: problem.problem_slug,
      problem_title: problem.problem_title,
      difficulty: problem.difficulty,
      problem_tags: problem.problem_tags,
    };
    if (failedCase) {
      await recordSubmission(session, {
        ...problemMetadata,
        language: String(parsed.data.language_id),
        verdict: failedCase.result.status_id === 3 ? "Wrong Answer" : failedCase.result.status,
        failed_test_case: failedCase.testCase,
      });
      response.json({
        accepted: false,
        verdict: failedCase.result.status_id === 3
          ? "Wrong Answer"
          : failedCase.result.status,
        failed_test_case: failedCase.testCase,
      });
      return;
    }

    await recordSubmission(session, {
      ...problemMetadata,
      language: String(parsed.data.language_id),
      verdict: "Accepted",
      failed_test_case: null,
    });
    const streak = await getCurrentStreak(session);
    response.json({ accepted: true, verdict: "Accepted", ...streak });
  } catch (error) {
    if (error instanceof Judge0ServiceError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  } finally {
    clearTimeout(timeout);
  }
});
