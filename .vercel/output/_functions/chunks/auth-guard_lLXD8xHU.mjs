function requireAuth(Astro) {
  if (!Astro.locals.session || !Astro.locals.admin) {
    return Astro.redirect("/login");
  }
  return null;
}

export { requireAuth as r };
