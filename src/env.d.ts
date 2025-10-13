/// <reference types="astro/client" />

import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      authenticatedSupabase?: SupabaseClient<Database>;
      session: Session | null;
      admin: Database["public"]["Tables"]["admins"]["Row"] | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
