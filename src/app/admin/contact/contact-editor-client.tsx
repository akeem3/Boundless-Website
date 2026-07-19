"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveContactSettings } from "./actions";
import { Loader2Icon } from "lucide-react";

const contactSchema = z.object({
  whatsapp_number: z.string().min(1, "WhatsApp number is required"),
  whatsapp_generic_message: z.string().min(1, "Message is required"),
  whatsapp_find_team_message_template: z.string().min(1, "Template is required"),
  whatsapp_group_url: z.string().optional(),
  email_address: z.string().email("Invalid email"),
  email_default_subject: z.string().min(1, "Subject is required"),
  instagram_url: z.string().url("Invalid URL").or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactEditorClientProps {
  settings: {
    whatsapp_number: string;
    whatsapp_generic_message: string;
    whatsapp_find_team_message_template: string;
    whatsapp_group_url: string | null;
    email_address: string;
    email_default_subject: string;
    instagram_url: string;
  } | null;
}

export function ContactEditorClient({ settings }: ContactEditorClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsapp_number: settings?.whatsapp_number ? `+${settings.whatsapp_number}` : "",
      whatsapp_generic_message: settings?.whatsapp_generic_message ?? "",
      whatsapp_find_team_message_template:
        settings?.whatsapp_find_team_message_template ?? "",
      whatsapp_group_url: settings?.whatsapp_group_url ?? "",
      email_address: settings?.email_address ?? "",
      email_default_subject: settings?.email_default_subject ?? "",
      instagram_url: settings?.instagram_url ?? "",
    },
  });

  async function onSubmit(data: ContactFormData) {
    setSaving(true);
    const result = await saveContactSettings({
      ...data,
      whatsapp_group_url: data.whatsapp_group_url ?? "",
    });
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Contact settings saved.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">WhatsApp</h2>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            placeholder="+60 12 345 6789"
            {...register("whatsapp_number")}
          />
          <p className="text-xs text-foreground/60">
            Include country code with + prefix (e.g. +60 for Malaysia)
          </p>
          {errors.whatsapp_number && (
            <p className="text-xs text-destructive">
              {errors.whatsapp_number.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_generic_message">
            Generic WhatsApp Message
          </Label>
          <Textarea
            id="whatsapp_generic_message"
            rows={2}
            {...register("whatsapp_generic_message")}
          />
          {errors.whatsapp_generic_message && (
            <p className="text-xs text-destructive">
              {errors.whatsapp_generic_message.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_find_team_message_template">
            Find-a-Team Message Template
          </Label>
          <Textarea
            id="whatsapp_find_team_message_template"
            rows={3}
            {...register("whatsapp_find_team_message_template")}
          />
          <p className="text-xs text-foreground/60">
            Use {"{tournament_title}"} as a placeholder for the tournament name.
          </p>
          {errors.whatsapp_find_team_message_template && (
            <p className="text-xs text-destructive">
              {errors.whatsapp_find_team_message_template.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_group_url">WhatsApp Group URL</Label>
          <Input
            id="whatsapp_group_url"
            placeholder="https://chat.whatsapp.com/..."
            {...register("whatsapp_group_url")}
          />
          <p className="text-xs text-foreground/60">
            Direct link to your WhatsApp group. Used for the "Join the WhatsApp group" CTA.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Email</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email_address">Email Address</Label>
            <Input
              id="email_address"
              type="email"
              {...register("email_address")}
            />
            {errors.email_address && (
              <p className="text-xs text-destructive">
                {errors.email_address.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email_default_subject">Default Email Subject</Label>
            <Input id="email_default_subject" {...register("email_default_subject")} />
            {errors.email_default_subject && (
              <p className="text-xs text-destructive">
                {errors.email_default_subject.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Social & Links</h2>
        <div className="space-y-2">
          <Label htmlFor="instagram_url">Instagram URL</Label>
          <Input
            id="instagram_url"
            placeholder="https://instagram.com/..."
            {...register("instagram_url")}
          />
          {errors.instagram_url && (
            <p className="text-xs text-destructive">
              {errors.instagram_url.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </form>
  );
}
