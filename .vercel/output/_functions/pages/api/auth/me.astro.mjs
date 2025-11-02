export { renderers } from '../../../renderers.mjs';

const GET = async ({ locals }) => {
  const { session, admin } = locals;
  if (!session || !admin) {
    return new Response(
      JSON.stringify({
        user: null,
        admin: null
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
  return new Response(
    JSON.stringify({
      user: session.user,
      admin
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
