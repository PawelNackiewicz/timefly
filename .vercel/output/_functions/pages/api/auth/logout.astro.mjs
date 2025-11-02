import { c as createSupabaseServerClient } from '../../../chunks/supabase.server_5l-SslkN.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ cookies }) => {
  try {
    const supabase = createSupabaseServerClient(cookies);
    const { error } = await supabase.auth.signOut();
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    return new Response(
      JSON.stringify({
        message: "Logged out successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An error occurred during logout"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
