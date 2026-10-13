import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function SignInPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
