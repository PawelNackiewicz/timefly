/**
 * Server-side Supabase client configuration
 * Uses cookies for session management in SSR context
 */

import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client for server-side use with cookie-based session management
 */
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          // Return empty array - Supabase will use get() fallback
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
        get(name) {
          return cookies.get(name)?.value;
        },
      },
    }
  );
}
