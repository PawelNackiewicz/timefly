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
          console.log("🍪 [getAll] called");
          // Return empty array - Supabase SSR will use get() for individual cookies
          return [];
        },
        setAll(cookiesToSet) {
          console.log(
            "🍪 [setAll] called with",
            cookiesToSet.length,
            "cookies"
          );
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`  → Setting cookie: ${name}`);
            cookies.set(name, value, options);
          });
        },
        get(name) {
          const value = cookies.get(name)?.value;
          if (value) {
            console.log(`🍪 [get] "${name}" → ✓ found`);
          }
          return value;
        },
        set(name, value, options) {
          console.log(`🍪 [set] "${name}" → setting cookie`);
          cookies.set(name, value, options);
        },
        remove(name, options) {
          console.log(`🍪 [remove] "${name}" → removing cookie`);
          cookies.delete(name, options);
        },
      },
    }
  );
}
