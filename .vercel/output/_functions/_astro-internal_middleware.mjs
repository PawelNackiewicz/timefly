import { d as defineMiddleware, s as sequence } from './chunks/index_CxfuN9p_.mjs';
import { c as createSupabaseServerClient } from './chunks/supabase.server_5l-SslkN.mjs';
import './chunks/astro-designed-error-pages_DCHw6B6G.mjs';
import './chunks/astro/server_-TuaRVNq.mjs';
import 'clsx';

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/reset-password",
  "/clock",
  "/api/auth/login",
  "/api/auth/logout"
];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);
  const {
    data: { session }
  } = await supabase.auth.getSession();
  context.locals.supabase = supabase;
  context.locals.session = session;
  let admin = null;
  if (session?.user) {
    const supabaseQuery = supabase.from("admins").select("*");
    const result = await supabaseQuery.eq("user_id", session.user.id).single();
    admin = result.data;
    context.locals.admin = admin;
  }
  const pathname = context.url.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );
  if (!isPublicRoute && (!session || !admin)) {
    return context.redirect("/login");
  }
  if (pathname === "/login" && session && admin) {
    return context.redirect("/dashboard");
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
