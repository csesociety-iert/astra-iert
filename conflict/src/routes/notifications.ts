import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireSession } from "../middleware/require-session.js";
import { getSession } from "../lib/session.js";
import type { SessionClaims } from "../lib/session.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export const notificationRouter = Router();

const notificationSchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(1).max(1200),
});

const readNotificationsSchema = z.object({
  notification_ids: z.array(z.uuid()).max(100),
});

function accountId(session: SessionClaims) {
  return session.accountType === "member"
    ? session.societyId ?? session.userId
    : session.userId;
}

function isAdmin(session: SessionClaims) {
  const allowedIds = new Set(
    env.ASTRA_ADMIN_ACCOUNT_IDS.split(",").map((id) => id.trim()).filter(Boolean),
  );
  return allowedIds.has(accountId(session));
}

notificationRouter.get("/", async (request, response, next) => {
  try {
    const session = await getSession(request);
    if (!session) {
      response.json({
        notifications: [],
        unread_count: 0,
        is_admin: false,
        authenticated: false,
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data: notifications, error: notificationsError } = await supabase
      .from("astra_notifications")
      .select("id, title, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (notificationsError) throw notificationsError;

    const notificationIds = notifications.map(({ id }) => id);
    let readIds = new Set<string>();
    if (notificationIds.length) {
      const { data: readNotifications, error: readsError } = await supabase
        .from("astra_notification_reads")
        .select("notification_id")
        .eq("account_type", session.accountType)
        .eq("user_id", accountId(session))
        .in("notification_id", notificationIds);
      if (readsError) throw readsError;
      readIds = new Set(readNotifications.map(({ notification_id }) => notification_id));
    }

    const result = notifications.map((notification) => ({
      ...notification,
      is_read: readIds.has(notification.id),
    }));
    response.json({
      notifications: result,
      unread_count: result.filter(({ is_read }) => !is_read).length,
      is_admin: isAdmin(session),
      authenticated: true,
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.post("/", requireSession, async (request, response, next) => {
  const parsed = notificationSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Enter a title and message for the notification." });
    return;
  }

  const session = request.astraSession;
  if (!session) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  if (!isAdmin(session)) {
    response.status(403).json({ error: "You do not have permission to publish notifications." });
    return;
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("astra_notifications")
      .insert({
        ...parsed.data,
        created_by: accountId(session),
      })
      .select("id, title, message, created_at")
      .single();
    if (error) throw error;
    response.status(201).json({ notification: data });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch("/read", requireSession, async (request, response, next) => {
  const parsed = readNotificationsSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "The notification list is invalid." });
    return;
  }
  const session = request.astraSession;
  if (!session) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  if (!parsed.data.notification_ids.length) {
    response.json({ marked_read: 0 });
    return;
  }

  try {
    const reads = parsed.data.notification_ids.map((notificationId) => ({
      notification_id: notificationId,
      account_type: session.accountType,
      user_id: accountId(session),
    }));
    const { data, error } = await getSupabaseAdmin()
      .from("astra_notification_reads")
      .upsert(reads, { onConflict: "notification_id,account_type,user_id", ignoreDuplicates: true })
      .select("notification_id");
    if (error) throw error;
    response.json({ marked_read: data.length });
  } catch (error) {
    next(error);
  }
});
