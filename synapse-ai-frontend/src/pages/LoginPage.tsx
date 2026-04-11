import { AuthLayout } from "../components/auth/AuthLayout.tsx";
import { LoginForm } from "../components/auth/LoginForm.tsx";

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
