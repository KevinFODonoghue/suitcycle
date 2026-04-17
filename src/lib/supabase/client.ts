import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnvOnly } from "@/env.mjs";

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(
      clientEnvOnly.NEXT_PUBLIC_SUPABASE_URL,
      clientEnvOnly.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return browserClient;
}

export function publicUrl({
  bucket,
  path,
}: {
  bucket: string;
  path: string;
}): string {
  const base = clientEnvOnly.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "");
  const cleanedPath = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanedPath}`;
}
