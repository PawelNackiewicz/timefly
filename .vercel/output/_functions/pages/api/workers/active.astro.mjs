import { W as WorkerService } from '../../../chunks/worker.service_DPoofiO9.mjs';
import { s as successResponse, h as handleError } from '../../../chunks/error-handler_KWzIATZF.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async (context) => {
  try {
    const workerService = new WorkerService(context.locals.supabase);
    const result = await workerService.listWorkers({
      is_active: true,
      limit: 1e3
      // Get all active workers
    });
    const { data: activeRegistrations } = await context.locals.supabase.from("time_registrations").select("worker_id").eq("status", "in_progress");
    const activeWorkerIds = new Set(
      activeRegistrations?.map((reg) => reg.worker_id) || []
    );
    const workers = result.workers.map((worker) => ({
      id: worker.id,
      first_name: worker.first_name,
      last_name: worker.last_name,
      department: worker.department,
      has_active_registration: activeWorkerIds.has(worker.id)
    }));
    return new Response(JSON.stringify(successResponse({ workers }).body), {
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
