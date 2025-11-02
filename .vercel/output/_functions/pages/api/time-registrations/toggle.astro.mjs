import { T as TimeRegistrationService } from '../../../chunks/time-registration.service_uvo_Xk49.mjs';
import { a as toggleTimeRegistrationSchema } from '../../../chunks/time-registration.validators_DhaQsRur.mjs';
import { s as successResponse, h as handleError } from '../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async (context) => {
  try {
    const body = await context.request.json();
    const { pin } = toggleTimeRegistrationSchema.parse(body);
    const service = new TimeRegistrationService(context.locals.supabase);
    const result = await service.toggleCheckInOut(pin);
    const message = result.action === "check_in" ? "Check-in successful" : "Check-out successful";
    const status = result.action === "check_in" ? 201 : 200;
    return new Response(
      JSON.stringify(successResponse(result, message, status).body),
      {
        status,
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
