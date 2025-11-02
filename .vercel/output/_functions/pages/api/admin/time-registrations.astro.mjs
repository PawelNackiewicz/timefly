import { T as TimeRegistrationService } from '../../../chunks/time-registration.service_uvo_Xk49.mjs';
import { l as listTimeRegistrationsQuerySchema, c as createTimeRegistrationSchema } from '../../../chunks/time-registration.validators_DhaQsRur.mjs';
import { r as requireAdmin } from '../../../chunks/auth.middleware_NS9Yv1TI.mjs';
import { s as successResponse, p as paginationMetadata, h as handleError } from '../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listTimeRegistrationsQuerySchema.parse(queryParams);
    const service = new TimeRegistrationService(authSupabase);
    const result = await service.listTimeRegistrations(validatedParams);
    return new Response(
      JSON.stringify(
        successResponse({
          registrations: result.registrations,
          pagination: paginationMetadata(
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total_items
          )
        }).body
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    const errorResult = handleError(error);
    return new Response(JSON.stringify(errorResult.body), {
      status: errorResult.status,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async (context) => {
  try {
    const { admin, supabase: authSupabase } = await requireAdmin(context);
    const body = await context.request.json();
    const validatedData = createTimeRegistrationSchema.parse(
      body
    );
    const service = new TimeRegistrationService(authSupabase);
    const registration = await service.createTimeRegistration(
      validatedData,
      admin.id
    );
    return new Response(
      JSON.stringify(
        successResponse(
          registration,
          "Time registration created successfully",
          201
        ).body
      ),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
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
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
