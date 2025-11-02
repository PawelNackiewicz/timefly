import { e as createComponent, f as createAstro, h as addAttribute, n as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_-TuaRVNq.mjs';
/* empty css                                     */
import { R as ResetPasswordWrapper } from '../chunks/AuthWrapper_CYKZMJ3W.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$ResetPassword = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ResetPassword;
  if (Astro2.locals.session && Astro2.locals.admin) {
    return Astro2.redirect("/dashboard");
  }
  const url = new URL(Astro2.request.url);
  const hasResetToken = url.searchParams.has("token_hash") && url.searchParams.has("type");
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="TimeTrack - Reset Your Password"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Reset Password - TimeTrack</title>${renderHead()}</head> <body> ${renderComponent($$result, "ResetPasswordWrapper", ResetPasswordWrapper, { "hasResetToken": hasResetToken, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/AuthWrapper", "client:component-export": "ResetPasswordWrapper" })} </body></html>`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/pages/reset-password.astro", void 0);

const $$file = "/Users/pawelnackiewicz/Projects/timefly/src/pages/reset-password.astro";
const $$url = "/reset-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
