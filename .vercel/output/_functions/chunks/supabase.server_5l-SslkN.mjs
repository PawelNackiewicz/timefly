import { createServerClient } from '@supabase/ssr';

function createSupabaseServerClient(cookies) {
  return createServerClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWhjcWh1a2xsc3pieXZvYXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Nzg4MzgsImV4cCI6MjA3NTM1NDgzOH0.8ip5n_qBPmZBhbK5g2AG5xcJ8HZnkhYIvVlZo427gbQ",
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
        get(name) {
          const value = cookies.get(name)?.value;
          return value;
        },
        set(name, value, options) {
          cookies.set(name, value, options);
        },
        remove(name, options) {
          cookies.delete(name, options);
        }
      }
    }
  );
}

export { createSupabaseServerClient as c };
