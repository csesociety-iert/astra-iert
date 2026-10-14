"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Code2, History, Medal, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, apiUrl } from "@/lib/api";
import { contests, featuredProblems, leaderboard, submissions } from "@/lib/data";

type UserProfile = {
  id: string;
  account_type: "member" | "outsider";
  email: string;
  first_name: string;
  last_name: string;
  society_id?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  avatar_url?: string | null;
  aktu_enrollment_number?: string | null;
  admission_batch_year?: number | null;
  branch?: string | null;
  secondary_email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  whatsapp_same_as_mobile?: boolean;
  address?: string | null;
  profile_complete?: number;
};

const emptyProfile = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  blood_group: "",
  aktu_enrollment_number: "",
  admission_batch_year: "",
  branch: "",
  secondary_email: "",
  mobile_number: "",
  whatsapp_number: "",
  whatsapp_same_as_mobile: true,
  address: "",
};

function calculatedYear(batchYear: number | null | undefined) {
  if (!batchYear) return null;
  const academicYear = new Date().getFullYear() - batchYear + (new Date().getMonth() >= 6 ? 1 : 0);
  if (academicYear < 1) return null;
  return academicYear > 4 ? "Completed" : `Year ${academicYear}`;
}

export function ProfileDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [welcomeToast, setWelcomeToast] = useState("");

  useEffect(() => {
    const firstName = sessionStorage.getItem("astra-welcome-name");
    if (firstName === null) return;
    sessionStorage.removeItem("astra-welcome-name");
    let dismissTimeout: number | undefined;
    const showTimeout = window.setTimeout(() => {
      setWelcomeToast(firstName || "there");
      dismissTimeout = window.setTimeout(() => setWelcomeToast(""), 5000);
    });
    return () => {
      window.clearTimeout(showTimeout);
      if (dismissTimeout !== undefined) window.clearTimeout(dismissTimeout);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await apiRequest<{ user: UserProfile }>("/api/profile/me");
    setProfile(result.user);
    setForm({
      first_name: result.user.first_name ?? "",
      last_name: result.user.last_name ?? "",
      date_of_birth: result.user.date_of_birth ?? "",
      gender: result.user.gender ?? "",
      blood_group: result.user.blood_group ?? "",
      aktu_enrollment_number: result.user.aktu_enrollment_number ?? "",
      admission_batch_year: result.user.admission_batch_year?.toString() ?? "",
      branch: result.user.branch ?? "",
      secondary_email: result.user.secondary_email ?? "",
      mobile_number: result.user.mobile_number ?? "",
      whatsapp_number: result.user.whatsapp_number ?? "",
      whatsapp_same_as_mobile: result.user.whatsapp_same_as_mobile ?? true,
      address: result.user.address ?? "",
    });
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(refreshProfile)
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.message.includes("sign in")) {
          router.replace("/");
          return;
        }
        setError(cause instanceof Error ? cause.message : "Could not load your profile.");
      })
      .finally(() => setLoading(false));
  }, [refreshProfile, router]);

  const completion = profile?.profile_complete ?? 0;
  const year = useMemo(
    () => calculatedYear(Number(form.admission_batch_year) || null),
    [form.admission_batch_year],
  );

  function setField<Key extends keyof typeof emptyProfile>(
    key: Key,
    value: (typeof emptyProfile)[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        aktu_enrollment_number: form.aktu_enrollment_number || null,
        admission_batch_year: form.admission_batch_year ? Number(form.admission_batch_year) : null,
        branch: form.branch || null,
        secondary_email: form.secondary_email || null,
        mobile_number: form.mobile_number || null,
        whatsapp_number: form.whatsapp_same_as_mobile ? null : form.whatsapp_number || null,
        address: form.address || null,
      };
      const result = await apiRequest<{ user: UserProfile }>("/api/profile/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setProfile(result.user);
      setMessage("Your profile has been saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG, or WebP photo up to 5 MB.");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const uploaded = await fetch(
        `${apiUrl}/api/profile/photo`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": file.type },
          body: file,
        },
      );
      const result = (await uploaded.json()) as { avatar_url?: string; error?: string };
      if (!uploaded.ok) throw new Error(result.error ?? "Could not upload your photo.");
      await refreshProfile();
      setPreview("");
      setMessage("Profile photo uploaded.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload your photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function signOut() {
    setError("");
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  if (loading) {
    return <main className="dashboard-loading">Loading your profile…</main>;
  }
  if (!profile) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-load-error">
          <p role="alert">{error || "Could not load your profile."}</p>
          <Link href="/">Return to sign in</Link>
        </div>
      </main>
    );
  }

  const isOutsider = profile.account_type === "outsider";
  return (
    <div className="profile-dashboard">
      {welcomeToast && (
        <div className="welcome-toast" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span><strong>Welcome back, {welcomeToast}!</strong><small>Your ASTRA workspace is ready.</small></span>
          <button type="button" onClick={() => setWelcomeToast("")} aria-label="Dismiss welcome message">
            <X size={16} />
          </button>
        </div>
      )}
      <header className="dashboard-topbar">
        <Link href="/dashboard" className="dashboard-brand">
          <span className="dashboard-brand-wordmark">ASTRA</span>
        </Link>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link href="/dashboard" aria-current="page">Home</Link>
          <Link href="/problems">Practice</Link>
          <Link href="/contests">Contests</Link>
          <Link href="/submissions">Submissions</Link>
          <Link href="/leaderboard">Rankings</Link>
        </nav>
        <div className="dashboard-account">
          <span className="dashboard-account-type">{isOutsider ? "Outsider account" : "Society member"}</span>
          <span className="dashboard-avatar" aria-hidden="true">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" />
            ) : (
              (profile.first_name || profile.email).charAt(0).toUpperCase()
            )}
          </span>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">CSE SOCIETY · IERT PRAYAGRAJ</p>
          <h1>Take control of your <span>coding future.</span></h1>
          <p className="dashboard-intro">
            Master data structures, algorithms, and problem solving with your ASTRA coding workspace.
          </p>
          <div className="dashboard-hero-actions">
            <Link href="/problems" className="dashboard-primary-action">Start solving <ArrowUpRight size={16} /></Link>
            <Link href="/contests" className="dashboard-secondary-action">Explore contests</Link>
          </div>
          {profile.society_id && <span className="member-id-chip">Society ID · {profile.society_id}</span>}
        </section>
        {error && <p className="dashboard-message error" role="alert">{error}</p>}

        <section className="dashboard-code-preview" aria-label="ASTRA coding workspace preview">
          <div className="dashboard-editor-toolbar">
            <span className="dashboard-window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="dashboard-editor-tab"><Code2 size={13} /> two_sum.py <i /></span>
            <span className="dashboard-editor-ready">READY</span>
            <Link href={`/problems/${featuredProblems[0].slug}`} className="dashboard-run-button">
              <Code2 size={14} /> Open workspace
            </Link>
          </div>
          <div className="dashboard-editor-body">
            <div className="dashboard-code-lines" aria-label="Example Python solution">
              <span><i>1</i><code><b>def</b> two_sum(nums, target):</code></span>
              <span><i>2</i><code>    seen = {"{}"}</code></span>
              <span><i>3</i><code>    <b>for</b> index, value <b>in</b> enumerate(nums):</code></span>
              <span><i>4</i><code>        complement = target - value</code></span>
              <span><i>5</i><code>        <b>if</b> complement <b>in</b> seen:</code></span>
              <span><i>6</i><code>            <b>return</b> [seen[complement], index]</code></span>
            </div>
            <div className="dashboard-editor-aside">
              <span className="dashboard-editor-aside-icon"><Code2 size={17} /></span>
              <p>READY WHEN YOU ARE</p>
              <strong>Your next challenge is one click away.</strong>
              <Link href={`/problems/${featuredProblems[0].slug}`}>Try Two Sum <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="dashboard-overview" aria-labelledby="workspace-heading">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">ASTRA WORKSPACE</p>
              <h2 id="workspace-heading">Your next step starts here</h2>
            </div>
            <Link href="/problems" className="dashboard-view-all">
              Browse all problems <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Code2 size={17} /></span>
              <div><strong>{featuredProblems.length}</strong><span>Featured problems</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Trophy size={17} /></span>
              <div><strong>{contests.length}</strong><span>Contest listings</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><History size={17} /></span>
              <div><strong>{submissions.length}</strong><span>Recent sample submissions</span></div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon"><Medal size={17} /></span>
              <div><strong>{leaderboard.length}</strong><span>Leaderboard entries</span></div>
            </article>
          </div>

          <div className="dashboard-content-grid">
            <section className="dashboard-content-card" aria-labelledby="featured-heading">
              <div className="dashboard-card-heading">
                <div>
                  <p className="dashboard-eyebrow">PICK A CHALLENGE</p>
                  <h3 id="featured-heading">Featured problems</h3>
                </div>
                <Link href="/problems" aria-label="View all problems"><ArrowUpRight size={17} /></Link>
              </div>
              <div className="dashboard-problem-list">
                {featuredProblems.map((problem) => (
                  <Link key={problem.slug} href={`/problems/${problem.slug}`} className="dashboard-problem-row">
                    <span><strong>{problem.title}</strong><small>{problem.id} · {problem.topic}</small></span>
                    <span className={`dashboard-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="dashboard-content-card" aria-labelledby="contests-heading">
              <div className="dashboard-card-heading">
                <div>
                  <p className="dashboard-eyebrow">COMING UP</p>
                  <h3 id="contests-heading">Contests</h3>
                </div>
                <Link href="/contests" aria-label="View all contests"><ArrowUpRight size={17} /></Link>
              </div>
              <div className="dashboard-contest-list">
                {contests.slice(0, 2).map((contest) => (
                  <div key={contest.title} className="dashboard-contest-row">
                    <span className="dashboard-contest-mark"><Trophy size={15} /></span>
                    <span><strong>{contest.title}</strong><small>{contest.date} · {contest.duration}</small></span>
                    <span className="dashboard-contest-status">{contest.status}</span>
                  </div>
                ))}
              </div>
              <Link href="/contests" className="dashboard-subtle-link">Explore all contests <ArrowUpRight size={14} /></Link>
            </section>
          </div>
        </section>

        {isOutsider ? (
          <div className="dashboard-grid">
            <section className="profile-edit-card">
              <div className="profile-card-heading">
                <div>
                  <h2>Profile details</h2>
                  <p>Only the details you choose to provide are shown on your profile.</p>
                </div>
                <span className="profile-private-label">Private by default</span>
              </div>

              <div className="photo-row">
                <div className="profile-photo">
                  {preview || profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview || profile.avatar_url || ""} alt="Your profile" />
                  ) : (
                    <span>{profile.first_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="photo-copy">
                  <strong>Profile photograph</strong>
                  <p>JPG, PNG or WebP · up to 5 MB</p>
                  <label className="upload-photo-button">
                    {uploading ? "Uploading…" : "Upload photo"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} disabled={uploading} />
                  </label>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label htmlFor="profile-first-name">First name</label>
                    <input id="profile-first-name" value={form.first_name} onChange={(event) => setField("first_name", event.target.value)} required />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-last-name">Last name</label>
                    <input id="profile-last-name" value={form.last_name} onChange={(event) => setField("last_name", event.target.value)} required />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-email">Email address</label>
                    <input id="profile-email" type="email" value={profile.email} readOnly />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-secondary-email">Secondary email <span>Optional</span></label>
                    <input id="profile-secondary-email" type="email" value={form.secondary_email} onChange={(event) => setField("secondary_email", event.target.value)} placeholder="another@email.com" />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-dob">Date of birth</label>
                    <input id="profile-dob" type="date" value={form.date_of_birth} onChange={(event) => setField("date_of_birth", event.target.value)} />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-gender">Gender</label>
                    <select id="profile-gender" value={form.gender} onChange={(event) => setField("gender", event.target.value)}>
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-blood-group">Blood group <span>Optional</span></label>
                    <select id="profile-blood-group" value={form.blood_group} onChange={(event) => setField("blood_group", event.target.value)}>
                      <option value="">Select blood group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group}>{group}</option>)}
                    </select>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-enrollment">AKTU enrollment number</label>
                    <input id="profile-enrollment" value={form.aktu_enrollment_number} onChange={(event) => setField("aktu_enrollment_number", event.target.value)} />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-batch">Admission batch year</label>
                    <input id="profile-batch" type="number" min="2000" max="2100" value={form.admission_batch_year} onChange={(event) => setField("admission_batch_year", event.target.value)} placeholder="e.g. 2024" />
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-current-year">Current year</label>
                    <input id="profile-current-year" value={year ?? "Calculated from admission batch"} readOnly />
                    <small>Calculated automatically; you do not need to enter this.</small>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-branch">Branch</label>
                    <select id="profile-branch" value={form.branch} onChange={(event) => setField("branch", event.target.value)}>
                      <option value="">Select branch</option>
                      {["Computer Science & Engineering", "Information Technology", "Electronics Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Other"].map((branch) => <option key={branch}>{branch}</option>)}
                    </select>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-mobile">Mobile number</label>
                    <input id="profile-mobile" type="tel" autoComplete="tel" value={form.mobile_number} onChange={(event) => setField("mobile_number", event.target.value)} />
                  </div>
                  <div className="profile-field profile-field-wide">
                    <label className="same-number-toggle">
                      <input
                        type="checkbox"
                        checked={form.whatsapp_same_as_mobile}
                        onChange={(event) => setField("whatsapp_same_as_mobile", event.target.checked)}
                      />
                      My WhatsApp number is the same as my mobile number
                    </label>
                  </div>
                  {!form.whatsapp_same_as_mobile && (
                    <div className="profile-field">
                      <label htmlFor="profile-whatsapp">WhatsApp number</label>
                      <input id="profile-whatsapp" type="tel" value={form.whatsapp_number} onChange={(event) => setField("whatsapp_number", event.target.value)} />
                    </div>
                  )}
                  <div className="profile-field profile-field-wide">
                    <label htmlFor="profile-address">Current address</label>
                    <textarea id="profile-address" rows={3} value={form.address} onChange={(event) => setField("address", event.target.value)} />
                  </div>
                </div>

                {message && <p className="dashboard-message success" role="status">{message}</p>}
                <div className="profile-form-actions">
                  <p>Fields are saved securely to your ASTRA profile.</p>
                  <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
                </div>
              </form>
            </section>

            <aside className="completion-card">
              <div className="completion-card-heading">
                <div>
                  <p>PROFILE COMPLETION</p>
                  <h2>Your profile</h2>
                </div>
                <strong>{completion}%</strong>
              </div>
              <div className="completion-track"><span style={{ width: `${completion}%` }} /></div>
              <p className="completion-hint">
                {completion === 100
                  ? "You’re all set. Your profile is complete."
                  : "Complete the details below to finish setting up your account."}
              </p>
              <ul className="completion-checklist">
                {[
                  ["name", "First and last name", Boolean(profile.first_name && profile.last_name)],
                  ["photo", "Profile photograph", Boolean(profile.avatar_url)],
                  ["dob", "Date of birth and gender", Boolean(profile.date_of_birth && profile.gender)],
                  ["enrollment", "Enrollment and academic details", Boolean(profile.aktu_enrollment_number && profile.admission_batch_year && profile.branch)],
                  ["mobile", "Mobile number", Boolean(profile.mobile_number)],
                  ["address", "Current address", Boolean(profile.address)],
                ].map(([key, label, complete]) => (
                  <li key={String(key)} className={complete ? "is-complete" : ""}>
                    <span>{complete ? "✓" : ""}</span>{label}
                  </li>
                ))}
              </ul>
              <div className="privacy-note">
                <strong>Your information matters</strong>
                <p>Profile information is private and used to support your CSE Society portal account.</p>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
