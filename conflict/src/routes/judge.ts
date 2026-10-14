import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { executeCode, Judge0ServiceError } from "../services/judge0Service.js";
import { requireSession } from "../middleware/require-session.js";
import { getCurrentStreak } from "../lib/streak.js";
import { recordSubmission } from "../lib/submissions.js";

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
  problem_slug: z.literal("longest-substring-without-repeating-characters"),
  language_id: z.union([
    z.string().trim().min(1).max(40),
    z.number().int(),
  ]),
  source_code: z.string().min(1).max(30_000).refine((source) => source.trim().length > 0),
});

const longestSubstringCases = [
  { input: "abcabcbb\n", expected: "3" },
  { input: "bbbbb\n", expected: "1" },
  { input: "pwwkew\n", expected: "3" },
  { input: "abba\n", expected: "2" },
  { input: "dvdf\n", expected: "3" },
  { input: "\n", expected: "0" },
];

const problemMetadata = {
  problem_slug: "longest-substring-without-repeating-characters",
  problem_title: "Longest Substring Without Repeating Characters",
  difficulty: "Medium" as const,
  problem_tags: ["strings", "sliding-window"],
};

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
    const results = await Promise.all(
      longestSubstringCases.map(async (testCase, index) => ({
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
      result.stdout?.replace(/\r\n/g, "\n").trim() !== expected,
    );
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
