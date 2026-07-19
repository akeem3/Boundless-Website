"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  extractStoragePath,
  removeStorageFiles,
} from "@/lib/supabase/storage";
import { validateUpload } from "@/lib/validation/upload";
import { revalidatePath } from "next/cache";

export async function getSponsors() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching sponsors:", error);
    return [];
  }
  return data;
}

export async function saveSponsor(formData: {
  id?: string;
  name: string;
  logo_url: string;
  sort_order: number;
  active: boolean;
}) {
  const supabase = createServiceClient();

  if (formData.id) {
    const { data: old } = await supabase
      .from("sponsors")
      .select("logo_url")
      .eq("id", formData.id)
      .maybeSingle();

    if (old && old.logo_url && old.logo_url !== formData.logo_url) {
      const path = extractStoragePath(old.logo_url, "sponsor-logos");
      if (path) {
        await removeStorageFiles(supabase, "sponsor-logos", [path]);
      }
    }
  }

  const payload = {
    id: formData.id || undefined,
    name: formData.name,
    logo_url: formData.logo_url,
    sort_order: formData.sort_order,
    active: formData.active,
  };

  const { error } = await supabase.from("sponsors").upsert(payload);

  if (error) {
    console.error("Error saving sponsor:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSponsor(id: string) {
  const supabase = createServiceClient();

  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("logo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("sponsors").delete().eq("id", id);

  if (error) {
    console.error("Error deleting sponsor:", error);
    return { error: error.message };
  }

  if (sponsor?.logo_url) {
    const path = extractStoragePath(sponsor.logo_url, "sponsor-logos");
    if (path) {
      await removeStorageFiles(supabase, "sponsor-logos", [path]);
    }
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  return { success: true };
}

export async function uploadSponsorLogo(
  file: File
): Promise<{ error?: string; url?: string }> {
  const validationError = validateUpload(file);
  if (validationError) return validationError;

  const supabase = createServiceClient();
  const fileName = `logo-${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("sponsor-logos")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading logo:", error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("sponsor-logos")
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

export async function reorderSponsors(ids: string[]) {
  const supabase = createServiceClient();

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("sponsors")
      .update({ sort_order: i })
      .eq("id", ids[i]);

    if (error) {
      console.error("Error reordering sponsors:", error);
      return { error: error.message };
    }
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  return { success: true };
}
