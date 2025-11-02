import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import { c as cn, B as Button } from './button_BCog2DPo.mjs';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, L as Label, I as Input } from './label_BU7B6RIP.mjs';
import { cva } from 'class-variance-authority';
import { ClockIcon, AlertCircleIcon, ArrowLeftIcon, CheckCircleIcon, MailIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setUser(data.user);
      setAdmin(data.admin);
    } catch (error) {
      console.error("Error fetching auth state:", error);
      setUser(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refreshAuth();
  }, []);
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
      setUser(null);
      setAdmin(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        admin,
        loading,
        login,
        logout,
        refreshAuth,
        resetPassword
      },
      children
    }
  );
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-full bg-primary p-3", children: /* @__PURE__ */ jsx(ClockIcon, { className: "h-8 w-8 text-primary-foreground" }) }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center", children: "Welcome to TimeTrack" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "Sign in to your admin account to continue" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", "data-testid": "error-alert", children: [
          /* @__PURE__ */ jsx(AlertCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "admin@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              disabled: loading,
              required: true,
              autoComplete: "email",
              "data-testid": "email-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              placeholder: "Enter your password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              disabled: loading,
              required: true,
              autoComplete: "current-password",
              "data-testid": "password-input"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: loading,
            "data-testid": "submit-button",
            children: loading ? "Signing in..." : "Sign in"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsx(
        "a",
        {
          href: "/reset-password",
          className: "text-sm text-muted-foreground hover:text-primary underline",
          children: "Forgot password?"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsx("p", { children: "Admin access only" }) })
    ] })
  ] }) });
}

function ResetPasswordHandler() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState(null);
  const [type, setType] = useState(null);
  useEffect(() => {
    const urlParams = new URL(window.location.href).searchParams;
    const tokenParam = urlParams.get("token_hash");
    const typeParam = urlParams.get("type");
    setToken(tokenParam);
    setType(typeParam);
  }, []);
  useEffect(() => {
    if (type === "recovery" && token) {
      setIsValidToken(true);
    } else if (type !== null) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [token, type]);
  const handleSubmit = async (e) => {
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
      const supabase = createClient(
        undefined                                   ,
        undefined                                        
      );
      const { error: error2 } = await supabase.auth.updateUser({
        password
      });
      if (error2) {
        throw error2;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 3e3);
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
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-full bg-destructive p-3", children: /* @__PURE__ */ jsx(AlertCircleIcon, { className: "h-8 w-8 text-destructive-foreground" }) }) }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center", children: "Invalid Reset Link" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "This password reset link is invalid or has expired." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
          /* @__PURE__ */ jsx(AlertCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error || "Please request a new password reset link from the login page." })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleBackToLogin,
            className: "w-full mt-4",
            variant: "outline",
            children: [
              /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-4 w-4 mr-2" }),
              "Back to Login"
            ]
          }
        )
      ] })
    ] }) });
  }
  if (success) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-full bg-primary p-3", children: /* @__PURE__ */ jsx(CheckCircleIcon, { className: "h-8 w-8 text-primary-foreground" }) }) }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center", children: "Password Reset Successfully" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "Your password has been updated successfully." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs(Alert, { children: [
          /* @__PURE__ */ jsx(CheckCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: "You will be redirected to the login page in a few seconds." })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: handleBackToLogin, className: "w-full mt-4", children: "Continue to Login" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-full bg-primary p-3", children: /* @__PURE__ */ jsx(ClockIcon, { className: "h-8 w-8 text-primary-foreground" }) }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center", children: "Set New Password" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "Enter your new password below" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
          /* @__PURE__ */ jsx(AlertCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "new-password", children: "New Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "new-password",
              type: "password",
              placeholder: "Enter new password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              disabled: loading,
              required: true,
              autoComplete: "new-password"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "confirm-password",
              type: "password",
              placeholder: "Confirm new password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              disabled: loading,
              required: true,
              autoComplete: "new-password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Updating Password..." : "Update Password" })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: handleBackToLogin,
          className: "w-full mt-4",
          variant: "outline",
          children: [
            /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-4 w-4 mr-2" }),
            "Back to Login"
          ]
        }
      )
    ] })
  ] }) });
}

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();
  const handleSubmit = async (e) => {
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
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center mb-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBackToLogin,
            className: "absolute left-4 top-4 p-2 hover:bg-muted rounded-md transition-colors",
            type: "button",
            children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "rounded-full bg-primary p-3", children: /* @__PURE__ */ jsx(MailIcon, { className: "h-8 w-8 text-primary-foreground" }) })
      ] }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center", children: "Reset Password" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "Enter your email address and we'll send you a link to reset your password." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
          /* @__PURE__ */ jsx(AlertCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: error })
        ] }),
        success && /* @__PURE__ */ jsxs(Alert, { children: [
          /* @__PURE__ */ jsx(CheckCircleIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: "Password reset email sent successfully! Please check your inbox and click the link to reset your password." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "reset-email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "reset-email",
              type: "email",
              placeholder: "admin@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              disabled: loading || success,
              required: true,
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: loading || success,
            children: loading ? "Sending..." : "Send Reset Link"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleBackToLogin,
          className: "text-sm text-muted-foreground hover:text-primary underline",
          children: "Back to Login"
        }
      ) })
    ] })
  ] }) });
}

function AuthWrapper() {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(LoginForm, {}) });
}
function ResetPasswordWrapper({
  hasResetToken
}) {
  return /* @__PURE__ */ jsx(AuthProvider, { children: hasResetToken ? /* @__PURE__ */ jsx(ResetPasswordHandler, {}) : /* @__PURE__ */ jsx(ResetPasswordForm, {}) });
}

export { AuthWrapper as A, ResetPasswordWrapper as R };
