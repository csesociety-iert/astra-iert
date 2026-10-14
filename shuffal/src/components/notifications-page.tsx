"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Clock3, Megaphone } from "lucide-react";
import { apiRequest } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

function notificationTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const result = await apiRequest<{
          notifications: Notification[];
          is_admin: boolean;
          authenticated: boolean;
        }>("/api/notifications");
        if (!active) return;

        setAuthenticated(result.authenticated);
        setNotifications(result.notifications);
        setIsAdmin(result.is_admin);
        const unreadIds = result.notifications
          .filter(({ is_read }) => !is_read)
          .map(({ id }) => id);

        if (unreadIds.length) {
          await apiRequest<{ marked_read: number }>("/api/notifications/read", {
            method: "PATCH",
            body: JSON.stringify({ notification_ids: unreadIds }),
          });
          if (active) {
            setNotifications((current) =>
              current.map((notification) => ({ ...notification, is_read: true })),
            );
          }
        }
        if (active) setError("");
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load notifications.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="container-shell portal-content notifications-page">
      <header className="notifications-heading">
        <p className="notifications-eyebrow"><Bell size={15} aria-hidden="true" /> YOUR INBOX</p>
        <h1>Notifications</h1>
        <p>Announcements and updates from the ASTRA team.</p>
      </header>

      {loading ? (
        <div className="notifications-state" role="status">Loading your notifications…</div>
      ) : !authenticated ? (
        <div className="notifications-empty">
          <span><Bell size={22} aria-hidden="true" /></span>
          <h2>Sign in to view your notifications</h2>
          <p>Announcements for your ASTRA account will appear here.</p>
          <Link className="notifications-signin-link" href="/login">Sign in</Link>
        </div>
      ) : error ? (
        <div className="notifications-state is-error" role="alert">
          <p>{error}</p>
          {error.toLowerCase().includes("sign in") && <Link href="/login">Sign in to view notifications</Link>}
        </div>
      ) : notifications.length ? (
        <section className="notifications-list" aria-label="Your notifications">
          {notifications.map((notification) => (
            <article
              className={`notification-card${notification.is_read ? "" : " is-unread"}`}
              key={notification.id}
            >
              <span className="notification-card-icon"><Megaphone size={19} aria-hidden="true" /></span>
              <div className="notification-card-content">
                <div className="notification-card-title-row">
                  <h2>{notification.title}</h2>
                  {!notification.is_read && <span className="notification-unread-label"><i />New</span>}
                </div>
                <p>{notification.message}</p>
                <time dateTime={notification.created_at}><Clock3 size={13} aria-hidden="true" />{notificationTime(notification.created_at)}</time>
              </div>
              {notification.is_read && <CheckCheck className="notification-read-icon" size={17} aria-label="Read" />}
            </article>
          ))}
        </section>
      ) : (
        <section className="notifications-empty">
          <span><Bell size={22} aria-hidden="true" /></span>
          <h2>You&apos;re all caught up</h2>
          <p>New announcements from the ASTRA team will appear here.</p>
        </section>
      )}

      {isAdmin && (
        <Link className="notifications-admin-link" href="/admin">
          <Megaphone size={15} aria-hidden="true" /> Publish an announcement
        </Link>
      )}
    </main>
  );
}
