/**
 * Authentication Middleware
 *
 * Verify admin authentication using Supabase JWT tokens
 */

import type { APIContext } from "astro";
import { AppError } from "../utils/error-handler";
import { API_ERROR_CODES } from "@/types";

/**
 * Require admin authentication for protected routes
 *
 * Validates JWT token from Authorization header and verifies user is an admin
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
  // Extract Authorization header
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

  // Verify user is an admin
  const { data: admin, error: adminError } = await context.locals.supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (adminError || !admin) {
    throw new AppError(API_ERROR_CODES.FORBIDDEN, 403, "User is not an admin");
  }

  return { user, admin };
}
