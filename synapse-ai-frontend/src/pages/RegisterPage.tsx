import { AuthLayout } from "../components/auth/AuthLayout.tsx";
import { RegisterForm } from "../components/auth/RegisterForm.tsx";

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
