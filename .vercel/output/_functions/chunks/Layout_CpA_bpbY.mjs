import { e as createComponent, f as createAstro, l as renderScript, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as renderHead, o as renderSlot } from './astro/server_-TuaRVNq.mjs';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { UserIcon, LogOutIcon, ClockIcon, LayoutDashboardIcon, UsersIcon, BarChartIcon } from 'lucide-react';
import { B as Button } from './button_BCog2DPo.mjs';

const $$Astro$1 = createAstro();
const $$UserMenu = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$UserMenu;
  const session = Astro2.locals.session;
  const admin = Astro2.locals.admin;
  const initials = admin ? `${admin.first_name[0]}${admin.last_name[0]}`.toUpperCase() : "";
  return renderTemplate`${!session || !admin ? renderTemplate`${renderComponent($$result, "Button", Button, { "size": "sm", "variant": "secondary", "className": "inline-flex" }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<a href="/login">Login</a>` })}` : renderTemplate`<div class="relative" data-user-menu><button type="button" data-user-menu-trigger class="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">${initials}</button><div data-user-menu-content class="hidden absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md z-50"><div class="px-2 py-1.5"><div class="flex flex-col space-y-1"><p class="text-sm font-medium leading-none">${admin.first_name}${admin.last_name}</p><p class="text-xs leading-none text-muted-foreground">${session.user.email}</p>${admin.department && renderTemplate`<p class="text-xs leading-none text-muted-foreground">${admin.department}</p>`}</div></div><div class="h-px bg-border my-1"></div><button type="button" disabled class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none opacity-50 pointer-events-none">${renderComponent($$result, "UserIcon", UserIcon, { "className": "mr-2 h-4 w-4" })}<span>Profile</span></button><div class="h-px bg-border my-1"></div><button type="button" data-logout-button class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-accent focus:bg-accent transition-colors">${renderComponent($$result, "LogOutIcon", LogOutIcon, { "className": "mr-2 h-4 w-4" })}<span>Log out</span></button></div></div>`}${renderScript($$result, "/Users/pawelnackiewicz/Projects/timefly/src/components/auth/UserMenu.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/components/auth/UserMenu.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  const pathname = Astro2.url.pathname;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="TimeTrack - Employee Work Hours Management System"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body> <div class="flex min-h-screen flex-col"> <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"> <div class="flex h-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center"> <div class="mr-4 hidden md:flex"> <a href="/dashboard" class="mr-6 flex items-center space-x-2"> ${renderComponent($$result, "ClockIcon", ClockIcon, { "class": "h-6 w-6" })} <span class="hidden font-bold sm:inline-block"> TimeTrack </span> </a> <nav class="flex items-center gap-6 text-sm"> <a href="/dashboard"${addAttribute(`transition-colors hover:text-foreground/80 ${pathname === "/dashboard" ? "text-foreground font-medium" : "text-foreground/60"}`, "class")}>
Dashboard
</a> <a href="/admin/employees"${addAttribute(`transition-colors hover:text-foreground/80 ${pathname.startsWith("/admin/employees") ? "text-foreground font-medium" : "text-foreground/60"}`, "class")}>
Employees
</a> <a href="/admin/reports"${addAttribute(`transition-colors hover:text-foreground/80 ${pathname.startsWith("/admin/reports") ? "text-foreground font-medium" : "text-foreground/60"}`, "class")}>
Reports
</a> <a href="/clock"${addAttribute(`transition-colors hover:text-foreground/80 ${pathname === "/clock" ? "text-foreground font-medium" : "text-foreground/60"}`, "class")}>
Clock In/Out
</a> </nav> </div> <button class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 mr-1 text-sm md:hidden" data-mobile-menu> ${renderComponent($$result, "ViewVerticalIcon", ViewVerticalIcon, { "class": "h-5 w-5" })} <span class="sr-only">Toggle Menu</span> </button> <div class="flex w-full items-center justify-between md:justify-end"> <div class="md:hidden flex items-center"> <a href="/dashboard" class="flex items-center space-x-2"> ${renderComponent($$result, "ClockIcon", ClockIcon, { "class": "h-6 w-6" })} <span class="font-bold">TimeTrack</span> </a> </div> <div class="flex items-center justify-end gap-2"> ${renderComponent($$result, "UserMenu", $$UserMenu, {})} </div> </div> </div> </header> <div id="mobile-menu" class="fixed inset-0 z-50 hidden flex-col bg-background shadow-lg animate-in gap-4 md:hidden"> <div class="flex h-14 items-center border-b px-4"> <a href="/dashboard" class="flex items-center gap-2"> ${renderComponent($$result, "ClockIcon", ClockIcon, { "class": "h-6 w-6" })} <span class="font-bold">TimeTrack</span> </a> <button data-close-mobile-menu class="ml-auto"> <span class="sr-only">Close</span> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"> <path d="M18 6 6 18"></path> <path d="m6 6 12 12"></path> </svg> </button> </div> <nav class="grid gap-2 p-4 text-lg font-medium"> <a href="/dashboard"${addAttribute(`flex items-center gap-2 rounded-md px-3 py-2 ${pathname === "/dashboard" ? "bg-accent" : "hover:bg-accent"}`, "class")}> ${renderComponent($$result, "LayoutDashboardIcon", LayoutDashboardIcon, { "class": "h-5 w-5" })}
Dashboard
</a> <a href="/admin/employees"${addAttribute(`flex items-center gap-2 rounded-md px-3 py-2 ${pathname.startsWith("/admin/employees") ? "bg-accent" : "hover:bg-accent"}`, "class")}> ${renderComponent($$result, "UsersIcon", UsersIcon, { "class": "h-5 w-5" })}
Employees
</a> <a href="/admin/reports"${addAttribute(`flex items-center gap-2 rounded-md px-3 py-2 ${pathname.startsWith("/admin/reports") ? "bg-accent" : "hover:bg-accent"}`, "class")}> ${renderComponent($$result, "BarChartIcon", BarChartIcon, { "class": "h-5 w-5" })}
Reports
</a> <a href="/clock"${addAttribute(`flex items-center gap-2 rounded-md px-3 py-2 ${pathname === "/clock" ? "bg-accent" : "hover:bg-accent"}`, "class")}> ${renderComponent($$result, "ClockIcon", ClockIcon, { "class": "h-5 w-5" })}
Clock In/Out
</a> </nav> </div> ${renderSlot($$result, $$slots["default"])} </div> ${renderScript($$result, "/Users/pawelnackiewicz/Projects/timefly/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body></html>`;
}, "/Users/pawelnackiewicz/Projects/timefly/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
