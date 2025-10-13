import { AuthProvider } from "./AuthProvider";
import { LoginForm } from "./LoginForm";

export function AuthWrapper() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
