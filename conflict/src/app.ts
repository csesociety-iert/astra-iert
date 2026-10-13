import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { profileRouter } from "./routes/profile.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/health", healthRouter);
app.use(errorHandler);
