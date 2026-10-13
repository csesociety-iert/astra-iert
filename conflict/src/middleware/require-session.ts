import type { RequestHandler } from "express";
import { getSession } from "../lib/session.js";

export const requireSession: RequestHandler = async (request, response, next) => {
  const session = await getSession(request);
  if (!session) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }

  request.astraSession = session;
  next();
};
