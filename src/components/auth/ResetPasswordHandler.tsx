import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";

export function ResetPasswordHandler() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    // Get URL parameters after component mounts (client-side)
    const urlParams = new URL(window.location.href).searchParams;
    const tokenParam = urlParams.get("token_hash");
    const typeParam = urlParams.get("type");

    setToken(tokenParam);
    setType(typeParam);
  }, []);

  useEffect(() => {
    // Check if we have a valid reset token
    if (type === "recovery" && token) {
      setIsValidToken(true);
    } else if (type !== null) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [token, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Create a new Supabase client for this operation
      const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY
      );

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  if (!isValidToken && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-destructive p-3">
                <AlertCircleIcon className="h-8 w-8 text-destructive-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  "Please request a new password reset link from the login page."}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleBackToLogin}
              className="w-full mt-4"
              variant="outline"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary p-3">
                <CheckCircleIcon className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Password Reset Successfully
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to the login page in a few seconds.
              </AlertDescription>
            </Alert>
            <Button onClick={handleBackToLogin} className="w-full mt-4">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <ClockIcon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Set New Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
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

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <Button
            onClick={handleBackToLogin}
            className="w-full mt-4"
            variant="outline"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
