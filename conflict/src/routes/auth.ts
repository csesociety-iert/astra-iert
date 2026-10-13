import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { clearSessionCookie, setSessionCookie } from "../lib/session.js";

export const authRouter = Router();

const passwordSaltRounds = 10;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const loginSchema = z.object({
  identifier: z.string().trim().min(2).max(254),
  password: z.string().min(1).max(128),
});

const registerSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

function safeOutsider(row: Record<string, unknown>) {
  const {
    password_hash: _passwordHash,
    ...profile
  } = row;
  return {
    ...profile,
    account_type: "outsider" as const,
    profile_complete: profileComplete(profile),
  };
}

function safeMember(profile: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(profile).filter(([key]) => !/(password|secret|token|hash)/i.test(key)),
  );
}

function profileComplete(profile: Record<string, unknown>) {
  const required = [
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
  return Math.round((required.filter((field) => Boolean(profile[field])).length / required.length) * 100);
}

async function findOutsiderByEmail(email: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("astra_credentials")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

async function findMember(identifier: string, isEmail: boolean, password: string) {
  const supabase = getSupabaseAdmin();
  const loginColumn = isEmail ? env.MEMBER_LOGIN_EMAIL_COLUMN : env.MEMBER_LOGIN_ID_COLUMN;
  const { data: account, error: accountError } = await supabase
    .from(env.MEMBER_USER_TABLE)
    .select("*")
    .eq(loginColumn, isEmail ? identifier.toLowerCase() : identifier)
    .maybeSingle();

  if (accountError) throw accountError;
  if (!account) return null;

  const passwordHash = account[env.MEMBER_PASSWORD_HASH_COLUMN];
  if (typeof passwordHash !== "string" || !passwordHash.startsWith("$2")) {
    throw new Error(
      `Member passwords must use bcrypt hashes. Check ${env.MEMBER_PASSWORD_HASH_COLUMN} in ${env.MEMBER_USER_TABLE}.`,
    );
  }

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) return null;

  const societyIdValue = account[env.MEMBER_LOGIN_ID_COLUMN];
  const email = account[env.MEMBER_LOGIN_EMAIL_COLUMN];
  const hasSocietyId = typeof societyIdValue === "string" || typeof societyIdValue === "number";
  const lookupColumn = hasSocietyId
    ? env.MEMBER_PROFILE_ID_COLUMN
    : env.MEMBER_PROFILE_EMAIL_COLUMN;
  const lookupValue = hasSocietyId ? String(societyIdValue) : email;
  if (typeof lookupValue !== "string") return null;

  const { data: profile, error: profileError } = await supabase
    .from(env.MEMBER_PROFILE_TABLE)
    .select("*")
    .eq(lookupColumn, lookupValue)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  return {
    account,
    profile: profile as Record<string, unknown>,
    societyId: hasSocietyId ? String(societyIdValue) : undefined,
  };
}

authRouter.post("/login", loginLimiter, async (request, response, next) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Enter your CSE ID or email and password." });
    return;
  }

  const identifier = parsed.data.identifier;
  const isEmail = identifier.includes("@");
  try {
    if (isEmail) {
      const outsider = await findOutsiderByEmail(identifier);
      if (outsider && typeof outsider.password_hash === "string") {
        if (await bcrypt.compare(parsed.data.password, outsider.password_hash)) {
          await setSessionCookie(response, {
            userId: String(outsider.id),
            accountType: "outsider",
          });
          response.json({ user: safeOutsider(outsider) });
          return;
        }
        response.status(401).json({ error: "The email or password is incorrect." });
        return;
      }
    }

    const account = await findMember(identifier, isEmail, parsed.data.password);
    if (!account) {
      response.status(401).json({ error: "The ID/email or password is incorrect." });
      return;
    }

    const userId = account.account[env.MEMBER_USER_PK_COLUMN];
    if (typeof userId !== "string" && typeof userId !== "number") {
      throw new Error(`Member credential table is missing its configured ${env.MEMBER_USER_PK_COLUMN} column.`);
    }

    await setSessionCookie(response, {
      userId: String(userId),
      accountType: "member",
      societyId: account.societyId,
    });
    response.json({
      user: {
        ...safeMember(account.profile),
        account_type: "member",
        profile_complete: 100,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/register", registrationLimiter, async (request, response, next) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Enter your first and last name, a valid email, and a password with at least 8 characters." });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const email = parsed.data.email.toLowerCase();
    const { data: existingMember, error: memberLookupError } = await supabase
      .from(env.MEMBER_USER_TABLE)
      .select(env.MEMBER_USER_PK_COLUMN)
      .eq(env.MEMBER_LOGIN_EMAIL_COLUMN, email)
      .maybeSingle();
    if (memberLookupError) throw memberLookupError;
    if (existingMember) {
      response.status(409).json({ error: "An account with this email is already registered. Sign in instead." });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, passwordSaltRounds);
    const { data, error } = await supabase
      .from("astra_credentials")
      .insert({
        email,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        password_hash: passwordHash,
      })
      .select("*")
      .single();

    if (error?.code === "23505") {
      response.status(409).json({ error: "An account with this email already exists. Sign in instead." });
      return;
    }
    if (error) throw error;

    const profile = data as Record<string, unknown>;
    await setSessionCookie(response, {
      userId: String(profile.id),
      accountType: "outsider",
    });
    response.status(201).json({ user: safeOutsider(profile) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});
