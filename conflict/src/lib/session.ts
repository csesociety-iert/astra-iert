import { SignJWT, jwtVerify } from "jose";
import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

const cookieName = "astra_session";
const sessionDurationSeconds = 60 * 30;

export type SessionClaims = {
  userId: string;
  accountType: "member" | "outsider";
  societyId?: string;
};

function getSecret() {
  if (!env.ASTRA_SESSION_SECRET) {
    throw new Error("ASTRA_SESSION_SECRET must be set on the backend and contain at least 32 characters.");
  }
  return new TextEncoder().encode(env.ASTRA_SESSION_SECRET);
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationSeconds * 1000,
  };
}

export async function setSessionCookie(response: Response, claims: SessionClaims) {
  const token = await new SignJWT({
    accountType: claims.accountType,
    societyId: claims.societyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getSecret());

  response.cookie(cookieName, token, cookieOptions());
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(cookieName, cookieOptions());
}

export async function getSession(request: Request): Promise<SessionClaims | null> {
  const token = request.cookies?.[cookieName] as string | undefined;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      (payload.accountType !== "member" && payload.accountType !== "outsider")
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      accountType: payload.accountType,
      societyId: typeof payload.societyId === "string" ? payload.societyId : undefined,
    };
  } catch {
    return null;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    astraSession?: SessionClaims;
  }
}
