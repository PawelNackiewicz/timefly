import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                     */
import { $ as $$Layout } from '../chunks/Layout_CpA_bpbY.mjs';
import { r as requireAuth } from '../chunks/auth-guard_lLXD8xHU.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const redirect = requireAuth(Astro2);
  if (redirect) return redirect;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "TimeTrack - Dashboard" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-slate-50 dark:bg-slate-900"> ${renderComponent($$result2, "DashboardWrapper", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/dashboard/DashboardWrapper", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/dashboard.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
