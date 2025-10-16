import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.server";
import type { Database } from "../db/database.types";

type Admin = Database["public"]["Tables"]["admins"]["Row"];

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/reset-password",
  "/clock",
  "/api/auth/login",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async (context, next) => {
  // Create server-side Supabase client with cookie support
  const supabase = createSupabaseServerClient(context.cookies);

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Store supabase client and session in locals
  context.locals.supabase = supabase as any;
  context.locals.session = session;

  // If user is authenticated, fetch their admin profile
  let admin: Admin | null = null;
  if (session?.user) {
    const supabaseQuery = supabase.from("admins").select("*");
    // @ts-ignore - Supabase column type inference issue
    const result = await supabaseQuery.eq("user_id", session.user.id).single();

    admin = result.data as unknown as Admin | null;
    context.locals.admin = admin;
  }

  // Get the current pathname
  const pathname = context.url.pathname;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // If route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && (!session || !admin)) {
    return context.redirect("/login");
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (pathname === "/login" && session && admin) {
    return context.redirect("/dashboard");
  }

  return next();
});
