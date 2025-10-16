import { AuthProvider } from "./AuthProvider";
import { LoginForm } from "./LoginForm";
import { ResetPasswordHandler } from "./ResetPasswordHandler";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function AuthWrapper() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}

interface ResetPasswordWrapperProps {
  hasResetToken: boolean;
}

export function ResetPasswordWrapper({
  hasResetToken,
}: ResetPasswordWrapperProps) {
  return (
    <AuthProvider>
      {hasResetToken ? <ResetPasswordHandler /> : <ResetPasswordForm />}
    </AuthProvider>
  );
}
