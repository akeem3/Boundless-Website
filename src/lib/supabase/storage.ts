import type { SupabaseClient } from "@supabase/supabase-js";

export function extractStoragePath(
  url: string,
  bucket: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = url.slice(idx + marker.length);
  return decodeURIComponent(raw);
}

export async function removeStorageFiles(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;

  const { data, error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.error(
      `Error removing files from ${bucket}:`,
      error.message,
      paths
    );
  } else {
    const removed = data?.length ?? 0;
    if (removed < paths.length) {
      console.warn(
        `Storage remove: requested ${paths.length} but only ${removed} removed`,
        paths
      );
    }
  }
}
