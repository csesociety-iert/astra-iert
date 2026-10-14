import type { SessionClaims } from "./session.js";
import { getSupabaseAdmin } from "./supabase.js";
import { isMissingStorageError, RequiredStorageError } from "./storage-errors.js";

export type SubmissionRecord = {
  id: string;
  problem_slug: string;
  problem_title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem_tags: string[];
  language: string;
  verdict: string;
  failed_test_case: number | null;
  created_at: string;
};

function throwDatabaseError(error: { code?: string; message: string }): never {
  if (isMissingStorageError(error, "astra_submissions")) {
    throw new RequiredStorageError("Submission");
  }
  throw error;
}

export async function recordSubmission(
  session: SessionClaims,
  submission: Omit<SubmissionRecord, "id" | "created_at">,
) {
  const { error } = await getSupabaseAdmin()
    .from("astra_submissions")
    .insert({
      account_type: session.accountType,
      user_id: session.userId,
      ...submission,
    });
  if (error) throwDatabaseError(error);
}

export async function getSubmissionSummary(session: SessionClaims) {
  const supabase = getSupabaseAdmin();
  const pageSize = 500;
  let offset = 0;
  const acceptedByProblem = new Map<string, Pick<SubmissionRecord, "problem_title" | "difficulty" | "problem_tags">>();

  while (true) {
    const { data, error } = await supabase
      .from("astra_submissions")
      .select("problem_slug,problem_title,difficulty,problem_tags,verdict")
      .eq("account_type", session.accountType)
      .eq("user_id", session.userId)
      .eq("verdict", "Accepted")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throwDatabaseError(error);

    for (const row of data ?? []) {
      const slug = String(row.problem_slug);
      if (!acceptedByProblem.has(slug)) {
        acceptedByProblem.set(slug, {
          problem_title: String(row.problem_title),
          difficulty: row.difficulty as SubmissionRecord["difficulty"],
          problem_tags: Array.isArray(row.problem_tags) ? row.problem_tags.map(String) : [],
        });
      }
    }
    if ((data ?? []).length < pageSize) break;
    offset += pageSize;
  }

  const recentResult = await supabase
    .from("astra_submissions")
    .select("id,problem_slug,problem_title,difficulty,problem_tags,language,verdict,failed_test_case,created_at")
    .eq("account_type", session.accountType)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (recentResult.error) throwDatabaseError(recentResult.error);

  const difficultySolved: Record<SubmissionRecord["difficulty"], number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  const tagCounts = new Map<string, number>();
  for (const problem of acceptedByProblem.values()) {
    difficultySolved[problem.difficulty] += 1;
    for (const tag of problem.problem_tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  return {
    total_solved: acceptedByProblem.size,
    difficulty_solved: difficultySolved,
    skill_tags: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag)),
    recent_submissions: (recentResult.data ?? []) as SubmissionRecord[],
  };
}
