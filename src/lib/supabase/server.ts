import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnvOnly, serverEnvOnly } from "@/env.mjs";

let serverClient: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClient) {
    const supabaseKey =
      serverEnvOnly.SUPABASE_SERVICE_ROLE_KEY ??
      clientEnvOnly.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    serverClient = createClient(
      clientEnvOnly.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return serverClient;
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
