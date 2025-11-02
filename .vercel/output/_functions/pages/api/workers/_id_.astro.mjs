import { W as WorkerService } from '../../../chunks/worker.service_DPoofiO9.mjs';
import { w as workerIdParamSchema, a as updateWorkerSchema } from '../../../chunks/worker.validators_CYUaRGLM.mjs';
import { r as requireAdmin } from '../../../chunks/auth.middleware_NS9Yv1TI.mjs';
import { s as successResponse, h as handleError } from '../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const { id } = workerIdParamSchema.parse({ id: context.params.id });
    const workerService = new WorkerService(authSupabase);
    const worker = await workerService.getWorkerById(id);
    return new Response(JSON.stringify(successResponse(worker).body), {
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
    const { supabase: authSupabase } = await requireAdmin(context);
    const { id } = workerIdParamSchema.parse({ id: context.params.id });
    const body = await context.request.json();
    const validatedData = updateWorkerSchema.parse(
      body
    );
    const workerService = new WorkerService(authSupabase);
    const worker = await workerService.updateWorker(id, validatedData);
    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker updated successfully").body
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
    const { id } = workerIdParamSchema.parse({ id: context.params.id });
    const workerService = new WorkerService(authSupabase);
    await workerService.deactivateWorker(id);
    return new Response(
      JSON.stringify(
        successResponse(null, "Worker deactivated successfully").body
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
