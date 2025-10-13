import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.server";

export const onRequest = defineMiddleware(async (context, next) => {
  // Create server-side Supabase client with cookie support
  const supabase = createSupabaseServerClient(context.cookies);

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Store supabase client and session in locals
  context.locals.supabase = supabase;
  context.locals.session = session;

  // If user is authenticated, fetch their admin profile
  if (session?.user) {
    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    context.locals.admin = admin;
  }

  return next();
});
