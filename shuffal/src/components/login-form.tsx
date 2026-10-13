"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type LoginResponse = {
  user: {
    account_type: "member" | "outsider";
    first_name?: string;
    last_name?: string;
  };
};

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form-card auth-login-card">
      <div className="auth-society-mark">
        <Image
          src="/cse-society-login.png"
          alt="CSE Society"
          width={96}
          height={73}
          priority
        />
      </div>
      <div className="auth-form-heading">
        <h1>Welcome Back</h1>
        <p>Sign in to continue your ASTRA journey</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-identifier">Society ID or Email</label>
        <div className="auth-input-wrap">
          {identifier.includes("@") ? <Mail size={14} /> : <UserRound size={14} />}
          <input
            id="login-identifier"
            autoComplete="username"
            placeholder="Enter your Society ID or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </div>

        <label htmlFor="login-password">Password</label>
        <div className="auth-input-wrap">
          <LockKeyhole size={14} />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
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

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={16} /> : null}
          {!busy ? <Zap size={16} /> : null}
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="auth-form-bottom">
        <p>New to ASTRA?</p>
        <Link href="/register">Create an account</Link>
      </div>
    </div>
  );
}
