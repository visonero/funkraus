import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the secret key — bypasses Row Level Security.
// Never import this into a Client Component or expose it to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
