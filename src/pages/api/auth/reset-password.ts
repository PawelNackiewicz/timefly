import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/db/supabase.server";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    const body = await request.json();
    const { email } = resetPasswordSchema.parse(body);

    const supabase = createSupabaseServerClient(cookies);

    // Create the redirect URL for password reset
    const resetUrl = new URL("/reset-password", url.origin);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl.toString(),
    });

    if (error) {
      console.error("❌ Password reset error:", error.message);
      return new Response(
        JSON.stringify({
          error: error.message,
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
        message: "Password reset email sent successfully",
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

    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while sending password reset email",
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
