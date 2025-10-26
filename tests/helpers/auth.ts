/**
 * Authentication Test Helpers
 *
 * Utilities for testing authentication flows
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

/**
 * Login as admin and return access token
 */
export async function loginAsAdmin(
  supabase: SupabaseClient<Database>,
  email: string = "admin@test.timefly.pl",
  password: string = "Test123!@#"
): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to login as admin: ${error.message}`);
  }

  if (!data.session?.access_token) {
    throw new Error("No access token returned from login");
  }

  return data.session.access_token;
}

/**
 * Create a mock admin session
 */
export function createMockAdminSession() {
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@test.timefly.pl",
      role: "authenticated",
    },
  };
}

/**
 * Create authorization header for admin requests
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
