/**
 * Server-side Supabase client configuration
 * Uses cookies for session management in SSR context
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
          // Return empty array - Supabase SSR will use get() for individual cookies
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
        get(name) {
          const value = cookies.get(name)?.value;
          if (value) {
          }
          return value;
        },
        set(name, value, options) {
          cookies.set(name, value, options);
        },
        remove(name, options) {
          cookies.delete(name, options);
        },
      },
    }
  );
}
