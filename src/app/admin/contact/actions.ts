"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getContactSettings() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contact_settings")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) {
    console.error("Error fetching contact settings:", error);
    return null;
  }
  return data;
}

export async function saveContactSettings(formData: {
  whatsapp_number: string;
  whatsapp_generic_message: string;
  whatsapp_find_team_message_template: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
  session_join_url: string;
}) {
  const supabase = createServiceClient();

  const normalizedNumber = formData.whatsapp_number.replace(/[^0-9]/g, "");

  const { error } = await supabase.from("contact_settings").upsert({
    id: "singleton",
    whatsapp_number: normalizedNumber,
    whatsapp_generic_message: formData.whatsapp_generic_message,
    whatsapp_find_team_message_template: formData.whatsapp_find_team_message_template,
    email_address: formData.email_address,
    email_default_subject: formData.email_default_subject,
    instagram_url: formData.instagram_url,
    session_join_url: formData.session_join_url || null,
  });

  if (error) {
    console.error("Error saving contact settings:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/contact");
  revalidatePath("/");
  return { success: true };
}
