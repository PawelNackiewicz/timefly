/**
 * Authentication guard utilities for protecting routes
 */

import type { AstroGlobal } from "astro";

/**
 * Require authentication for a page
 * Redirects to /login if user is not authenticated
 */
export function requireAuth(Astro: AstroGlobal) {
  if (!Astro.locals.session || !Astro.locals.admin) {
    return Astro.redirect("/login");
  }
  return null;
}

/**
 * Require guest (redirect authenticated users away)
 * Redirects to /dashboard if user is already authenticated
 */
export function requireGuest(Astro: AstroGlobal) {
  if (Astro.locals.session && Astro.locals.admin) {
    return Astro.redirect("/dashboard");
  }
  return null;
}
