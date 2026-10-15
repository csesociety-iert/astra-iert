import { env } from "../config/env.js";
import type { SessionClaims } from "./session.js";

export function adminAccountId(session: SessionClaims) {
  return session.accountType === "member"
    ? session.societyId ?? session.userId
    : session.userId;
}

export function isAdminAccount(session: SessionClaims) {
  const allowedIds = new Set(
    env.ASTRA_ADMIN_ACCOUNT_IDS.split(",").map((id) => id.trim()).filter(Boolean),
  );
  return allowedIds.has(adminAccountId(session));
}
