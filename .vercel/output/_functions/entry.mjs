import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Cb4T_drP.mjs';
import { manifest } from './manifest_CpWgAlDv.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/employees.astro.mjs');
const _page2 = () => import('./pages/admin/reports.astro.mjs');
const _page3 = () => import('./pages/api/admin/dashboard/recent-entries.astro.mjs');
const _page4 = () => import('./pages/api/admin/dashboard/stats.astro.mjs');
const _page5 = () => import('./pages/api/admin/time-registrations/_id_.astro.mjs');
const _page6 = () => import('./pages/api/admin/time-registrations.astro.mjs');
const _page7 = () => import('./pages/api/auth/login.astro.mjs');
const _page8 = () => import('./pages/api/auth/logout.astro.mjs');
const _page9 = () => import('./pages/api/auth/me.astro.mjs');
const _page10 = () => import('./pages/api/auth/reset-password.astro.mjs');
const _page11 = () => import('./pages/api/time-registrations/toggle.astro.mjs');
const _page12 = () => import('./pages/api/workers/active.astro.mjs');
const _page13 = () => import('./pages/api/workers/_id_/pin.astro.mjs');
const _page14 = () => import('./pages/api/workers/_id_.astro.mjs');
const _page15 = () => import('./pages/api/workers.astro.mjs');
const _page16 = () => import('./pages/clock.astro.mjs');
const _page17 = () => import('./pages/dashboard.astro.mjs');
const _page18 = () => import('./pages/login.astro.mjs');
const _page19 = () => import('./pages/reset-password.astro.mjs');
const _page20 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.14.1_@types+node@24.9.1_@vercel+functions@2.2.13_jiti@1.21.7_rollup@4.52.4_typescript@5.9.3_yaml@2.8.1/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/employees.astro", _page1],
    ["src/pages/admin/reports.astro", _page2],
    ["src/pages/api/admin/dashboard/recent-entries.ts", _page3],
    ["src/pages/api/admin/dashboard/stats.ts", _page4],
    ["src/pages/api/admin/time-registrations/[id].ts", _page5],
    ["src/pages/api/admin/time-registrations/index.ts", _page6],
    ["src/pages/api/auth/login.ts", _page7],
    ["src/pages/api/auth/logout.ts", _page8],
    ["src/pages/api/auth/me.ts", _page9],
    ["src/pages/api/auth/reset-password.ts", _page10],
    ["src/pages/api/time-registrations/toggle.ts", _page11],
    ["src/pages/api/workers/active.ts", _page12],
    ["src/pages/api/workers/[id]/pin.ts", _page13],
    ["src/pages/api/workers/[id].ts", _page14],
    ["src/pages/api/workers/index.ts", _page15],
    ["src/pages/clock.astro", _page16],
    ["src/pages/dashboard.astro", _page17],
    ["src/pages/login.astro", _page18],
    ["src/pages/reset-password.astro", _page19],
    ["src/pages/index.astro", _page20]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "6b546b35-5f1e-420a-abcc-fa758d283dc4",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
