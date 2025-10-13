import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { session, admin } = locals;

  if (!session || !admin) {
    return new Response(
      JSON.stringify({
        user: null,
        admin: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      user: session.user,
      admin: admin,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
