import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MailIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email"
      );
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handleBackToLogin}
              className="absolute left-4 top-4 p-2 hover:bg-muted rounded-md transition-colors"
              type="button"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <div className="rounded-full bg-primary p-3">
              <MailIcon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Password reset email sent successfully! Please check your
                  inbox and click the link to reset your password.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                required
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
