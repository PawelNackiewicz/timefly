import { D as DashboardService } from '../../../../chunks/dashboard.service_DgS6Ohl9.mjs';
import { r as recentEntriesQuerySchema } from '../../../../chunks/time-registration.validators_DhaQsRur.mjs';
import { r as requireAdmin } from '../../../../chunks/auth.middleware_NS9Yv1TI.mjs';
import { s as successResponse, h as handleError } from '../../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { limit } = recentEntriesQuerySchema.parse(queryParams);
    const service = new DashboardService(authSupabase);
    const entries = await service.getRecentEntries(limit);
    return new Response(JSON.stringify(successResponse({ entries }).body), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
