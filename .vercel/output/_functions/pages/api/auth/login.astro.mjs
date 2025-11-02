import { c as createSupabaseServerClient } from '../../../chunks/supabase.server_5l-SslkN.mjs';
import { z } from 'zod';
export { renderers } from '../../../renderers.mjs';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
const POST = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    const supabase = createSupabaseServerClient(cookies);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error("❌ Login error:", error.message);
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const { data: admin, error: adminError } = await supabase.from("admins").select("*").eq("user_id", data.user.id).single();
    if (adminError || !admin) {
      console.error("❌ User is not an admin");
      await supabase.auth.signOut();
      return new Response(
        JSON.stringify({
          error: "Access denied. Admin privileges required."
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    return new Response(
      JSON.stringify({
        user: data.user,
        admin
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.errors[0].message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    return new Response(
      JSON.stringify({
        error: "An error occurred during login"
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
