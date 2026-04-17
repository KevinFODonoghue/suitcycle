import { getSupabaseServerClient, publicUrl as getSupabasePublicUrl } from "./supabase/server";

export const supabase = getSupabaseServerClient();

export { getSupabaseServerClient, getSupabasePublicUrl };
export { getSupabaseBrowserClient, publicUrl as getBrowserSupabasePublicUrl } from "./supabase/client";
