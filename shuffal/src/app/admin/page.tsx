"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, BellRing, Megaphone } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { apiRequest } from "@/lib/api";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<{ is_admin: boolean; authenticated: boolean }>("/api/notifications")
      .then(({ is_admin: admin, authenticated: signedIn }) => {
        if (active) {
          setIsAdmin(admin);
          setAuthenticated(signedIn);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not verify admin access.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function publishAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPublishing(true);

    try {
      await apiRequest("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ title, message }),
      });
      setTitle("");
      setMessage("");
      setSuccess("Announcement published. Members will see a red dot for this new notification.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not publish the announcement.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <PortalShell>
      <main className="container-shell portal-content admin-page">
        <header className="admin-page-heading">
          <p className="notifications-eyebrow"><BellRing size={15} aria-hidden="true" /> ADMINISTRATION</p>
          <h1>Admin controls</h1>
          <p>Publish announcements for ASTRA members.</p>
        </header>

        {loading ? (
          <div className="admin-access-state" role="status">Checking admin access…</div>
        ) : !isAdmin ? (
          <section className="admin-access-state">
            <h2>{authenticated ? "Admin access required" : "Sign in required"}</h2>
            <p>{error || (authenticated
              ? "This account is not authorized to publish announcements."
              : "Sign in with an approved admin account to publish announcements.")}</p>
            {!authenticated && <Link href="/login">Sign in <ArrowRight size={15} aria-hidden="true" /></Link>}
          </section>
        ) : (
          <div className="admin-notification-layout">
            <section className="admin-notification-card">
              <div className="admin-notification-card-heading">
                <span><Megaphone size={18} aria-hidden="true" /></span>
                <div>
                  <h2>New announcement</h2>
                  <p>It will appear in every member&apos;s notifications.</p>
                </div>
              </div>

              {error && <p className="admin-form-message is-error" role="alert">{error}</p>}
              {success && <p className="admin-form-message is-success" role="status">{success}</p>}

              <form className="admin-notification-form" onSubmit={publishAnnouncement}>
                <label htmlFor="announcement-title">Title</label>
                <input
                  id="announcement-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  placeholder="e.g. Upcoming contest registration"
                  required
                />
                <label htmlFor="announcement-message">Message</label>
                <textarea
                  id="announcement-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1200}
                  rows={5}
                  placeholder="Write a clear announcement for members…"
                  required
                />
                <div className="admin-notification-form-footer">
                  <span>Members will see a red dot until they view the notification.</span>
                  <button type="submit" disabled={publishing}>
                    <Megaphone size={15} aria-hidden="true" />
                    {publishing ? "Publishing…" : "Publish announcement"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="admin-notification-aside">
              <h2>Notification delivery</h2>
              <p>Announcements are stored securely and delivered to all signed-in ASTRA accounts.</p>
              <Link href="/notifications">View notifications <ArrowRight size={15} aria-hidden="true" /></Link>
            </aside>
          </div>
        )}
      </main>
    </PortalShell>
  );
}
