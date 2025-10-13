import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/db/supabase.server";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createSupabaseServerClient(cookies);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Logged out successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An error occurred during logout",
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
