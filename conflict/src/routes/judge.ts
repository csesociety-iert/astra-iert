import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { executeCode, Judge0ServiceError } from "../services/judge0Service.js";
import { requireSession } from "../middleware/require-session.js";

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
