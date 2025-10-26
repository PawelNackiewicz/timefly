/**
 * Supabase Test Helpers
 *
 * Utilities for testing with Supabase
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

/**
 * Create a test Supabase client
 *
 * Uses environment variables for test database connection
 */
export function createTestClient() {
  const supabaseUrl =
    process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_TEST_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase test credentials not configured. Set SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Clean up test data from the database
 *
 * WARNING: Only use in test environment
 */
export async function cleanupTestData(
  client: ReturnType<typeof createTestClient>
) {
  // Delete in correct order due to foreign keys
  await client
    .from("time_registrations")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await client
    .from("workers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
}
