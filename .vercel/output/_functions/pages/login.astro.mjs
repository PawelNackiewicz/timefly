import { e as createComponent, f as createAstro, h as addAttribute, n as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                     */
import { A as AuthWrapper } from '../chunks/AuthWrapper_CYKZMJ3W.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  if (Astro2.locals.session && Astro2.locals.admin) {
    return Astro2.redirect("/dashboard");
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="TimeTrack - Employee Work Hours Management System"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Login - TimeTrack</title>${renderHead()}</head> <body> ${renderComponent($$result, "AuthWrapper", AuthWrapper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AuthWrapper", "client:component-export": "AuthWrapper" })} </body></html>`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/login.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
