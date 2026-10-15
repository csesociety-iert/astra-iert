import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireSession } from "../middleware/require-session.js";
import { isMissingStorageError, RequiredStorageError } from "../lib/storage-errors.js";
import type { SessionClaims } from "../lib/session.js";
import { adminAccountId, isAdminAccount } from "../lib/admin.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export const problemRouter = Router();

const builtInSlugs = new Set([
  "two-sum",
  "longest-substring-without-repeating-characters",
  "median-of-two-sorted-arrays",
  "valid-parentheses",
  "merge-intervals",
  "word-ladder",
]);

const testCaseSchema = z.object({
  input: z.string().max(10_000),
  expected: z.string().max(10_000),
});

export const problemQuestionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().trim().min(2).max(60),
  tags: z.array(z.string().trim().min(1).max(30)).min(1).max(10),
  description: z.string().trim().min(10).max(4_000),
  input_format: z.string().trim().min(1).max(2_000),
  output_format: z.string().trim().min(1).max(2_000),
  constraints: z.string().trim().min(1).max(2_000),
  sample_input: z.string().max(10_000),
  sample_output: z.string().max(10_000),
  starter_code: z.string().max(30_000).default(""),
  test_cases: z.array(testCaseSchema).min(1).max(25),
});

const createProblemsSchema = z.object({
  questions: z.array(problemQuestionSchema).min(1).max(25),
});

function problemSlug(title: string) {
  const slug = title.toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || `question-${randomUUID().slice(0, 8)}`;
}

function publicProblem(row: Record<string, unknown>) {
  const cases = Array.isArray(row.test_cases) ? row.test_cases : [];
  return {
    id: String(row.problem_id),
    title: String(row.title),
    slug: String(row.slug),
    difficulty: row.difficulty,
    tags: row.tags,
    status: "Unsolved" as const,
    acceptance: 0,
    description: String(row.description),
    topic: String(row.topic),
    inputFormat: String(row.input_format),
    outputFormat: String(row.output_format),
    constraints: String(row.constraints),
    sampleInput: String(row.sample_input),
    sampleOutput: String(row.sample_output),
    starterCode: String(row.starter_code ?? ""),
    testCaseCount: cases.length,
  };
}

function storageError(error: { code?: string; message: string }) {
  if (isMissingStorageError(error, "astra_problems")) {
    return new RequiredStorageError("Problem");
  }
  return error;
}

problemRouter.get("/", async (_request, response, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("astra_problems")
      .select("problem_id,title,slug,difficulty,tags,topic,description,input_format,output_format,constraints,sample_input,sample_output,starter_code,test_cases")
      .order("created_at", { ascending: false });
    if (error) throw storageError(error);
    response.json({ problems: (data ?? []).map((row) => publicProblem(row)) });
  } catch (error) {
    next(error);
  }
});

problemRouter.get("/:slug", async (request, response, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("astra_problems")
      .select("problem_id,title,slug,difficulty,tags,topic,description,input_format,output_format,constraints,sample_input,sample_output,starter_code,test_cases")
      .eq("slug", request.params.slug)
      .maybeSingle();
    if (error) throw storageError(error);
    if (!data) {
      response.status(404).json({ error: "Question not found." });
      return;
    }
    response.json({ problem: publicProblem(data) });
  } catch (error) {
    next(error);
  }
});

problemRouter.post("/", requireSession, async (request, response, next) => {
  const session = request.astraSession;
  if (!session) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  if (!isAdminAccount(session)) {
    response.status(403).json({ error: "You do not have permission to create questions." });
    return;
  }

  const parsed = createProblemsSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: "One or more questions are invalid. Check every required field and test case.",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const slugs = parsed.data.questions.map(({ title }) => problemSlug(title));
  const usedSlugs = new Set(builtInSlugs);
  for (const slug of slugs) {
    if (usedSlugs.has(slug)) {
      response.status(409).json({
        error: "Question titles must generate unique slugs and cannot reuse a built-in question URL.",
      });
      return;
    }
    usedSlugs.add(slug);
  }

  const rows = parsed.data.questions.map((question, index) => {
    const problemId = randomUUID();
    return {
      problem_id: `AST-${problemId.slice(0, 8).toUpperCase()}`,
      slug: slugs[index],
      ...question,
      created_by: adminAccountId(session),
    };
  });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("astra_problems")
      .insert(rows)
      .select("problem_id,title,slug,difficulty,tags,topic,description,input_format,output_format,constraints,sample_input,sample_output,starter_code,test_cases");
    if (error) {
      if (error.code === "23505") {
        response.status(409).json({
          error: "A question with the same title or generated slug already exists. Change the title and try again.",
        });
        return;
      }
      throw storageError(error);
    }
    response.status(201).json({ problems: (data ?? []).map((row) => publicProblem(row)) });
  } catch (error) {
    next(error);
  }
});
