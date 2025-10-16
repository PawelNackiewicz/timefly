import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/db/supabase.server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = createSupabaseServerClient(cookies);

    console.log("🔐 Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error.message);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Login successful, checking admin status...");

    // Check if user is an admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (adminError || !admin) {
      console.error("❌ User is not an admin");
      // Sign out the user if they're not an admin
      await supabase.auth.signOut();

      return new Response(
        JSON.stringify({
          error: "Access denied. Admin privileges required.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(
      "✅ Admin verified, session cookies should be set by Supabase SSR"
    );

    return new Response(
      JSON.stringify({
        user: data.user,
        admin: admin,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred during login",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
