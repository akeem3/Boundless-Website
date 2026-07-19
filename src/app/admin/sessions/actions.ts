"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSessions() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
  return data;
}

export async function createSession(formData: {
  starts_at: string;
  location: string;
  note: string;
  capacity: number;
  join_url: string;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("sessions").insert({
    starts_at: formData.starts_at,
    location: formData.location,
    note: formData.note || null,
    capacity: formData.capacity,
    join_url: formData.join_url || null,
  });

  if (error) {
    console.error("Error creating session:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function updateSession(
  id: string,
  formData: {
    starts_at: string;
    location: string;
    note: string;
    capacity: number;
    join_url: string;
  }
) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({
      starts_at: formData.starts_at,
      location: formData.location,
      note: formData.note || null,
      capacity: formData.capacity,
      join_url: formData.join_url || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating session:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/sessions");
  return { success: true };
}

export async function deleteSession(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting session:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/sessions");
  return { success: true };
}
