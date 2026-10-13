import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to conflict/.env, then restart the backend.");
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new SupabaseConfigurationError();
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
