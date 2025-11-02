import { W as WorkerService } from '../../chunks/worker.service_DPoofiO9.mjs';
import { l as listWorkersQuerySchema, c as createWorkerSchema } from '../../chunks/worker.validators_CYUaRGLM.mjs';
import { r as requireAdmin } from '../../chunks/auth.middleware_NS9Yv1TI.mjs';
import { s as successResponse, p as paginationMetadata, h as handleError } from '../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async (context) => {
  try {
    const { supabase: authSupabase } = await requireAdmin(context);
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = listWorkersQuerySchema.parse(queryParams);
    const workerService = new WorkerService(authSupabase);
    const result = await workerService.listWorkers(validatedParams);
    return new Response(
      JSON.stringify(
        successResponse({
          workers: result.workers,
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
    const { supabase: authSupabase } = await requireAdmin(context);
    const body = await context.request.json();
    const validatedData = createWorkerSchema.parse(
      body
    );
    const workerService = new WorkerService(authSupabase);
    const worker = await workerService.createWorker(validatedData);
    return new Response(
      JSON.stringify(
        successResponse(worker, "Worker created successfully", 201).body
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
