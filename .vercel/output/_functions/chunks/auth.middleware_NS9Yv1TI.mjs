import { createClient } from '@supabase/supabase-js';
import { A as AppError, a as API_ERROR_CODES } from './error-handler_KWzIATZF.mjs';

async function requireAdmin(context) {
  const session = context.locals.session;
  if (session?.user) {
    const user2 = session.user;
    const { data: admin2, error: adminError2 } = await context.locals.supabase.from("admins").select("*").eq("user_id", user2.id).single();
    if (adminError2 || !admin2) {
      throw new AppError(
        API_ERROR_CODES.FORBIDDEN,
        403,
        "User is not an admin"
      );
    }
    return { user: user2, admin: admin2, supabase: context.locals.supabase };
  }
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Missing or invalid authentication token"
    );
  }
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error
  } = await context.locals.supabase.auth.getUser(token);
  if (error || !user) {
    throw new AppError(
      API_ERROR_CODES.UNAUTHORIZED,
      401,
      "Invalid authentication token"
    );
  }
  const supabaseUrl = "http://127.0.0.1:54321";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWhjcWh1a2xsc3pieXZvYXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Nzg4MzgsImV4cCI6MjA3NTM1NDgzOH0.8ip5n_qBPmZBhbK5g2AG5xcJ8HZnkhYIvVlZo427gbQ";
  const authenticatedSupabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
  const { data: admin, error: adminError } = await authenticatedSupabase.from("admins").select("*").eq("user_id", user.id).single();
  if (adminError || !admin) {
    throw new AppError(API_ERROR_CODES.FORBIDDEN, 403, "User is not an admin");
  }
  return { user, admin, supabase: authenticatedSupabase };
}

export { requireAdmin as r };
