import Image from "next/image";
import Link from "next/link";
import { BookOpen, Code2, KeyRound, ShieldCheck } from "lucide-react";
import PortalFooter from "@/components/portal-footer";

const journeySteps = [
  {
    icon: ShieldCheck,
    title: "Sign in to your account",
    detail: "Members use their Society ID or registered email. New users can register.",
  },
  {
    icon: BookOpen,
    title: "Explore ASTRA",
    detail: "Find coding activities, society resources, and your member dashboard.",
  },
  {
    icon: Code2,
    title: "Learn and build",
    detail: "Take part in events, practice coding, and track your progress.",
  },
];

export function AuthShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
}) {
  return (
    <div className={`auth-page auth-experience-page ${mode === "login" ? "auth-login-page" : "auth-register-page"}`}>
      <div className="auth-nav-wrap auth-experience-nav">
        <header className="auth-topbar">
          <Link href="/" className="auth-brand" aria-label="CSE Society sign in">
            <Image src="/cse-society.png" alt="CSE Society logo" width={36} height={36} priority />
            <span>
              <strong>CSE Society</strong>
              <small>IERT Portal</small>
            </span>
          </Link>
        </header>
      </div>

      <main className="auth-main">
        <section className="auth-stage auth-experience-stage">
          <div className="auth-content auth-experience-content">
            <section className="auth-card-wrap auth-experience-form">{children}</section>
            <aside className="announcement-panel auth-journey-panel">
              <div className="announcement-heading auth-journey-heading">
                <h2>Your ASTRA Journey</h2>
                <p>Sign in to connect with the CSE Society and start building.</p>
              </div>
              <div className="announcement-list auth-journey-list">
                {journeySteps.map(({ icon: Icon, title, detail }, index) => (
                  <div className="auth-journey-item-group" key={title}>
                    <article className="announcement-card auth-journey-step">
                      <span className="auth-journey-icon"><Icon size={18} /></span>
                      <div>
                        <h3>{index === 0 ? "1" : index + 2}. {title}</h3>
                        <p>{detail}</p>
                      </div>
                    </article>
                    {index === 0 && (
                      <section className="announcement-card auth-credentials-guide" aria-labelledby="credentials-guide-title">
                        <h3 id="credentials-guide-title"><KeyRound size={17} /> 2. Login Credentials Guide</h3>
                        <div className="auth-credential-columns">
                          <div>
                            <span>MEMBER LOGIN</span>
                            <p>IDENTIFIER FIELD</p>
                            <strong>Society ID or registered email</strong>
                            <p>PASSWORD FIELD</p>
                            <strong>Existing member password</strong>
                          </div>
                          <div>
                            <span>OUTSIDER LOGIN</span>
                            <p>IDENTIFIER FIELD</p>
                            <strong>Registered email address</strong>
                            <p>PASSWORD FIELD</p>
                            <strong>Password created during registration</strong>
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                ))}
              </div>
              <Link className="announcement-link auth-journey-link" href={mode === "login" ? "/register" : "/"}>
                {mode === "login" ? "New to CSE Society? Register an account" : "Already registered? Sign in"}
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
