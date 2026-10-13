import type { ErrorRequestHandler } from "express";
import { SupabaseConfigurationError } from "../lib/supabase.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SupabaseConfigurationError) {
    console.error("Authentication service is not configured:", error.message);
    response.status(503).json({ error: error.message });
    return;
  }

  console.error("Unhandled API error:", error);
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number(error.status)
    : 500;
  response.status(status >= 400 && status < 500 ? status : 500).json({
    error: status === 413 ? "The uploaded file is too large. The maximum photo size is 5 MB." : "Internal server error",
  });
};
