import { Router } from "express";
import { requireSession } from "../middleware/require-session.js";
import { getCurrentStreak } from "../lib/streak.js";

export const streakRouter = Router();

streakRouter.get("/", requireSession, async (request, response, next) => {
  try {
    const session = request.astraSession;
    if (!session) throw new Error("Authenticated session is missing.");
    response.json(await getCurrentStreak(session));
  } catch (error) {
    next(error);
  }
});
