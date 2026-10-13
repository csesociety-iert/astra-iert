"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const first_name = String(formData.get("first_name") ?? "").trim();
    const last_name = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ first_name, last_name, email, password }),
      });
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form-card register-card">
      <div className="auth-logo-float">
        <Image src="/cse-society.png" alt="CSE Society" width={74} height={74} priority />
      </div>
      <div className="auth-form-heading">
        <h1>Create an account</h1>
        <p>Join ASTRA as a CSE Society guest</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="name-input-row">
          <div>
            <label htmlFor="first-name">First name</label>
            <input id="first-name" name="first_name" autoComplete="given-name" placeholder="First name" required maxLength={80} />
          </div>
          <div>
            <label htmlFor="last-name">Last name</label>
            <input id="last-name" name="last_name" autoComplete="family-name" placeholder="Last name" required maxLength={80} />
          </div>
        </div>

        <label htmlFor="register-email">Email address</label>
        <input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} />

        <label htmlFor="register-password">Create password</label>
        <div className="auth-input-wrap">
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            maxLength={128}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          name="confirm_password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
          minLength={8}
          maxLength={128}
        />

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={16} /> : null}
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div className="auth-form-bottom">
        <p>Already have an account?</p>
        <Link href="/">Sign in</Link>
      </div>
    </div>
  );
}
