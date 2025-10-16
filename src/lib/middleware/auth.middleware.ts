/**
 * Authentication Middleware
 *
 * Verify admin authentication using Supabase JWT tokens
 */

import type { APIContext } from "astro";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { AppError } from "../utils/error-handler";
import { API_ERROR_CODES } from "@/types";

/**
 * Require admin authentication for protected routes
 *
 * Validates authentication via session cookies (primary) or Authorization header (fallback)
 * and verifies user is an admin
 *
 * @param context - Astro API context with Supabase client
 * @returns Object containing authenticated user and admin profile
 * @throws AppError if authentication fails
 *
 * @example
 * export const GET: APIRoute = async (context) => {
 *   try {
 *     const { user, admin } = await requireAdmin(context);
 *     // Proceed with admin-only logic
 *   } catch (error) {
 *     return handleError(error);
 *   }
 * };
 */
export async function requireAdmin(context: APIContext) {
  // Try to get user from session (cookie-based auth) first
  const session = context.locals.session;

  if (session?.user) {
    // User is authenticated via session cookies
    const user = session.user;

    // Verify user is an admin using the server Supabase client
    const { data: admin, error: adminError } = await context.locals.supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      throw new AppError(
        API_ERROR_CODES.FORBIDDEN,
        403,
        "User is not an admin"
      );
    }

    return { user, admin, supabase: context.locals.supabase };
  }

  // Fallback to Authorization header (for API clients without cookies)
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Missing or invalid authentication token"
    );
  }

  // Extract JWT token
  const token = authHeader.replace("Bearer ", "");

  // Verify token and get user from Supabase
  const {
    data: { user },
    error,
  } = await context.locals.supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Invalid authentication token"
    );
  }

  // Create authenticated Supabase client with user's JWT token
  // This ensures the token is passed to all DB queries for RLS to work correctly
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

  const authenticatedSupabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Verify user is an admin using authenticated client (RLS will work correctly)
  const { data: admin, error: adminError } = await authenticatedSupabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (adminError || !admin) {
    throw new AppError(API_ERROR_CODES.FORBIDDEN, 403, "User is not an admin");
  }

  return { user, admin, supabase: authenticatedSupabase };
}
