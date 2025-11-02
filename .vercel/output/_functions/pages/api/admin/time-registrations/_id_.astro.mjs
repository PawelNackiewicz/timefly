import { T as TimeRegistrationService } from '../../../../chunks/time-registration.service_uvo_Xk49.mjs';
import { t as timeRegistrationIdParamSchema, u as updateTimeRegistrationSchema } from '../../../../chunks/time-registration.validators_DhaQsRur.mjs';
import { r as requireAdmin } from '../../../../chunks/auth.middleware_NS9Yv1TI.mjs';
import { s as successResponse, h as handleError } from '../../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id
    });
    const service = new TimeRegistrationService(authSupabase);
    const registration = await service.getTimeRegistrationById(id);
    return new Response(JSON.stringify(successResponse(registration).body), {
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
const PATCH = async (context) => {
  try {
    const { admin, supabase: authSupabase } = await requireAdmin(context);
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id
    });
    const body = await context.request.json();
    const validatedData = updateTimeRegistrationSchema.parse(
      body
    );
    const service = new TimeRegistrationService(authSupabase);
    const registration = await service.updateTimeRegistration(
      id,
      validatedData,
      admin.id
    );
    return new Response(
      JSON.stringify(
        successResponse(registration, "Time registration updated successfully").body
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
const DELETE = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const { id } = timeRegistrationIdParamSchema.parse({
      id: context.params.id
    });
    const service = new TimeRegistrationService(authSupabase);
    await service.deleteTimeRegistration(id);
    return new Response(
      JSON.stringify(
        successResponse(null, "Time registration deleted successfully").body
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
