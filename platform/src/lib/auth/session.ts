import { cache } from "react";
import { isDemoMode } from "@/lib/course/demo";
import { createClient } from "@/lib/supabase/server";

// Dev-only preview (DEMO_DASHBOARD=1): no login needed, the dashboard shows a made-up learner.
const DEMO_USER = { id: "00000000-0000-0000-0000-00000000d3a0", email: "demo@funkraus.de" } as const;

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && isDemoMode()) return DEMO_USER as unknown as NonNullable<typeof user>;
  return user;
});

export const getCurrentProfile = cache(async (userId: string) => {
  if (isDemoMode() && userId === DEMO_USER.id) return { full_name: "Alex Beispiel", email: DEMO_USER.email, is_admin: false, newsletter_opt_in: true };
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin, newsletter_opt_in")
    .eq("id", userId)
    .single();
  return data;
});
