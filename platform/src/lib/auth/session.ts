import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin, newsletter_opt_in")
    .eq("id", userId)
    .single();
  return data;
});
