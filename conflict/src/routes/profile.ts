import express, { Router } from "express";
import type { Request as ExpressRequest } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireSession } from "../middleware/require-session.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { getCurrentStreak } from "../lib/streak.js";
import { getSubmissionSummary } from "../lib/submissions.js";

export const profileRouter = Router();

const editableProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  date_of_birth: z.string().date().nullable().optional(),
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say"]).nullable().optional(),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional(),
  aktu_enrollment_number: z.string().trim().max(40).nullable().optional(),
  admission_batch_year: z.number().int().min(2000).max(2100).nullable().optional(),
  branch: z.string().trim().max(80).nullable().optional(),
  secondary_email: z.string().trim().email().max(254).nullable().optional(),
  mobile_number: z.string().trim().max(25).nullable().optional(),
  whatsapp_number: z.string().trim().max(25).nullable().optional(),
  whatsapp_same_as_mobile: z.boolean().optional(),
  address: z.string().trim().max(500).nullable().optional(),
});

function completion(profile: Record<string, unknown>) {
  const requiredFields = [
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "aktu_enrollment_number",
    "admission_batch_year",
    "branch",
    "mobile_number",
    "address",
    "avatar_path",
  ];
  return Math.round(
    (requiredFields.filter((field) => Boolean(profile[field])).length / requiredFields.length) * 100,
  );
}

function getDisplayPhotoUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const photoUrl = value.trim();
  if (!/^https?:\/\/(?:www\.)?drive\.google\.com\//i.test(photoUrl)) return photoUrl;

  const fileId =
    photoUrl.match(/\/file\/d\/([^/?#]+)/i)?.[1] ??
    photoUrl.match(/[?&]id=([^&#]+)/i)?.[1];
  return fileId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w256`
    : photoUrl;
}

async function withAvatarUrl(profile: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...profile, profile_complete: completion(profile) };
  if (profile.account_type === "member") {
    result.avatar_url = getDisplayPhotoUrl(profile.student_photograph);
    return result;
  }

  const avatarPath = profile.avatar_path;
  if (typeof avatarPath === "string" && avatarPath) {
    const { data, error } = await getSupabaseAdmin()
      .storage
      .from(env.PROFILE_PHOTO_BUCKET)
      .createSignedUrl(avatarPath, 60 * 60);
    if (error) throw error;
    result.avatar_url = data.signedUrl;
  } else {
    result.avatar_url = null;
  }
  return result;
}

async function loadProfile(request: ExpressRequest) {
  const session = request.astraSession;
  if (!session) throw new Error("Authenticated session is missing.");

  const supabase = getSupabaseAdmin();
  if (session.accountType === "outsider") {
    const { data, error } = await supabase
      .from("astra_credentials")
      .select("*")
      .eq("id", session.userId)
      .single();
    if (error) throw error;
    return data as Record<string, unknown>;
  }

  const { data, error } = await supabase
    .from(env.MEMBER_PROFILE_TABLE)
    .select("*")
    .eq(env.MEMBER_PROFILE_ID_COLUMN, session.societyId ?? "")
    .single();
  if (error) throw error;
  const memberProfile = data as Record<string, unknown>;
  return {
    ...memberProfile,
    aktu_enrollment_number: memberProfile.roll_number_aktu,
    admission_batch_year: memberProfile.admission_year,
    branch: memberProfile.branch_department,
    society_id: session.societyId,
    account_type: "member",
  };
}

profileRouter.get("/me", requireSession, async (request, response, next) => {
  try {
    const profile = await loadProfile(request);
    response.json({ user: await withAvatarUrl(profile) });
  } catch (error) {
    next(error);
  }
});

profileRouter.get("/stats", requireSession, async (request, response, next) => {
  try {
    const session = request.astraSession;
    if (!session) throw new Error("Authenticated session is missing.");
    const [activity, submissions] = await Promise.all([
      getCurrentStreak(session),
      getSubmissionSummary(session),
    ]);
    response.json({ ...activity, ...submissions });
  } catch (error) {
    next(error);
  }
});

profileRouter.patch("/me", requireSession, async (request, response, next) => {
  const parsed = editableProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Some profile details are invalid. Please check the fields and try again." });
    return;
  }

  const session = request.astraSession;
  if (!session || session.accountType !== "outsider") {
    response.status(403).json({ error: "Only outsider accounts can edit this profile." });
    return;
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("astra_credentials")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", session.userId)
      .select("*")
      .single();
    if (error) throw error;
    response.json({ user: await withAvatarUrl(data as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

profileRouter.post(
  "/photo",
  requireSession,
  (request, response, next) => {
    if (request.astraSession?.accountType !== "outsider") {
      response.status(403).json({ error: "Only outsider accounts can change this profile photo." });
      return;
    }
    next();
  },
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }),
  async (request, response, next) => {
    const contentType = request.header("content-type");
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = contentType ? extensions[contentType] : undefined;
    if (!extension || !Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ error: "Choose a JPG, PNG, or WebP photo." });
      return;
    }

    try {
      const session = request.astraSession;
      if (!session) throw new Error("Authenticated session is missing.");

      const supabase = getSupabaseAdmin();
      const path = `${session.userId}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(env.PROFILE_PHOTO_BUCKET)
        .upload(path, request.body, { contentType, upsert: true });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("astra_credentials")
        .update({ avatar_path: path, updated_at: new Date().toISOString() })
        .eq("id", session.userId);
      if (updateError) throw updateError;

      const { data, error: signedUrlError } = await supabase.storage
        .from(env.PROFILE_PHOTO_BUCKET)
        .createSignedUrl(path, 60 * 60);
      if (signedUrlError) throw signedUrlError;

      response.json({ avatar_path: path, avatar_url: data.signedUrl });
    } catch (error) {
      next(error);
    }
  },
);
