import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                     */
import { $ as $$Layout } from '../chunks/Layout_CpA_bpbY.mjs';
export { renderers } from '../renderers.mjs';

const $$Clock = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "TimeTrack - Clock In/Out" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-slate-50 dark:bg-slate-900"> ${renderComponent($$result2, "ClockWrapper", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/employee/ClockWrapper", "client:component-export": "default" })} </main> ` })}`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/clock.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/clock.astro";
const $$url = "/clock";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Clock,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
