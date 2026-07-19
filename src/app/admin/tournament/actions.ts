"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  extractStoragePath,
  removeStorageFiles,
} from "@/lib/supabase/storage";
import { validateUpload } from "@/lib/validation/upload";
import { revalidatePath } from "next/cache";

export async function getTournament() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching tournament:", error);
    return null;
  }
  return data;
}

export async function saveTournament(formData: {
  id?: string;
  title: string;
  starts_at: string;
  location: string;
  fee_myr: number;
  description: string;
  poster_url: string;
  registration_open: boolean;
  team_registration_url: string;
}) {
  const supabase = createServiceClient();

  if (formData.id) {
    const { data: old } = await supabase
      .from("tournaments")
      .select("poster_url")
      .eq("id", formData.id)
      .maybeSingle();

    if (old && old.poster_url && old.poster_url !== formData.poster_url) {
      const path = extractStoragePath(old.poster_url, "tournament-posters");
      if (path) {
        await removeStorageFiles(supabase, "tournament-posters", [path]);
      }
    }
  }

  const payload = {
    id: formData.id || undefined,
    title: formData.title,
    starts_at: formData.starts_at,
    location: formData.location,
    fee_myr: formData.fee_myr,
    description: formData.description || null,
    poster_url: formData.poster_url || null,
    registration_open: formData.registration_open,
    team_registration_url: formData.team_registration_url || null,
  };

  const { error } = await supabase.from("tournaments").upsert(payload);

  if (error) {
    console.error("Error saving tournament:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/tournament");
  revalidatePath("/");
  return { success: true };
}

export async function uploadTournamentPoster(
  file: File
): Promise<{ error?: string; url?: string }> {
  const validationError = validateUpload(file);
  if (validationError) return validationError;

  const supabase = createServiceClient();
  const fileName = `poster-${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("tournament-posters")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading poster:", error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("tournament-posters")
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}
