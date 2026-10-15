import { z } from "zod";
import { env } from "../config/env.js";
import { getSupabaseAdmin } from "./supabase.js";

function profileValue(
  profile: Record<string, unknown>,
  account: Record<string, unknown>,
  key: string,
) {
  const value = profile[key] ?? account[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function profileText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function profileDate(value: unknown) {
  const parsed = z.string().date().safeParse(value);
  return parsed.success ? parsed.data : null;
}

function profileChoice(value: unknown, choices: string[]) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return choices.find((choice) => choice.toLowerCase() === normalized) ?? null;
}

function profileYear(value: unknown) {
  const year = typeof value === "number" ? value : Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null;
}

function profilePhotoUrl(value: unknown) {
  const photo = profileText(value);
  if (!photo) return null;
  try {
    const parsed = new URL(photo);
    return parsed.protocol === "https:" && parsed.hostname ? photo : null;
  } catch {
    return null;
  }
}

export async function getOrCreateLinkedGuestProfile(
  account: Record<string, unknown>,
  profile: Record<string, unknown>,
) {
  const memberAccountId = account[env.MEMBER_USER_PK_COLUMN];
  if (typeof memberAccountId !== "string" && typeof memberAccountId !== "number") {
    throw new Error(`Member credential table is missing its configured ${env.MEMBER_USER_PK_COLUMN} column.`);
  }

  const email = account[env.MEMBER_LOGIN_EMAIL_COLUMN];
  if (typeof email !== "string" || !email.trim()) {
    throw new Error(`Accounts without a Society ID need a registered email in ${env.MEMBER_LOGIN_EMAIL_COLUMN}.`);
  }

  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from("astra_credentials")
    .select("*")
    .eq("member_account_id", String(memberAccountId))
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as Record<string, unknown>;

  const { data, error } = await supabase
    .from("astra_credentials")
    .insert({
      email: email.trim().toLowerCase(),
      password_hash: null,
      member_account_id: String(memberAccountId),
      first_name: profileValue(profile, account, "first_name"),
      last_name: profileValue(profile, account, "last_name"),
      date_of_birth: profileDate(profile.date_of_birth),
      gender: profileChoice(profile.gender, ["female", "male", "non_binary", "prefer_not_to_say"]),
      blood_group: profileChoice(profile.blood_group, ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
      avatar_url: profilePhotoUrl(profile.student_photograph),
      aktu_enrollment_number: profileText(profile.roll_number_aktu),
      admission_batch_year: profileYear(profile.admission_year),
      branch: profileText(profile.branch_department),
      secondary_email: profileText(profile.secondary_email),
      mobile_number: profileText(profile.mobile_number),
      whatsapp_number: profileText(profile.whatsapp_number),
      whatsapp_same_as_mobile: typeof profile.whatsapp_same_as_mobile === "boolean"
        ? profile.whatsapp_same_as_mobile
        : true,
      address: profileText(profile.address),
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const linked = await supabase
      .from("astra_credentials")
      .select("*")
      .eq("member_account_id", String(memberAccountId))
      .maybeSingle();
    if (linked.error) throw linked.error;
    if (linked.data) return linked.data as Record<string, unknown>;
  }
  if (error) throw error;
  return data as Record<string, unknown>;
}
