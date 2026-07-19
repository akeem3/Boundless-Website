"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveTournament, uploadTournamentPoster } from "./actions";
import { UploadIcon, Trash2Icon, Loader2Icon } from "lucide-react";

const tournamentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  starts_at: z.string().min(1, "Date & time is required"),
  location: z.string().min(1, "Location is required"),
  fee_myr: z.string().min(1, "Fee is required"),
  description: z.string().optional(),
  rules: z.string().optional(),
  poster_url: z.string().optional(),
  registration_open: z.boolean(),
  team_registration_url: z.string().optional(),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentEditorClientProps {
  tournament: {
    id: string;
    title: string;
    starts_at: string;
    location: string;
    fee_myr: number;
    description: string | null;
    rules: string | null;
    poster_url: string | null;
    registration_open: boolean;
    team_registration_url: string | null;
  } | null;
}

export function TournamentEditorClient({ tournament }: TournamentEditorClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      title: tournament?.title ?? "",
      starts_at: tournament?.starts_at
        ? new Date(tournament.starts_at).toISOString().slice(0, 16)
        : "",
      location: tournament?.location ?? "",
      fee_myr: String(tournament?.fee_myr ?? 0),
      description: tournament?.description ?? "",
      rules: tournament?.rules ?? "",
      poster_url: tournament?.poster_url ?? "",
      registration_open: tournament?.registration_open ?? false,
      team_registration_url: tournament?.team_registration_url ?? "",
    },
  });

  const posterUrl = watch("poster_url");
  const registrationOpen = watch("registration_open");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setUploading(true);
    const result = await uploadTournamentPoster(file);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setValue("poster_url", result.url, { shouldDirty: true });
      toast.success("Poster uploaded.");
    }
  }

  async function onSubmit(data: TournamentFormData) {
    setSaving(true);
    const result = await saveTournament({
      id: tournament?.id,
      title: data.title,
      starts_at: data.starts_at,
      location: data.location,
      fee_myr: Number(data.fee_myr),
      description: data.description ?? "",
      rules: data.rules ?? "",
      poster_url: data.poster_url ?? "",
      registration_open: data.registration_open,
      team_registration_url: data.team_registration_url ?? "",
    });
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Tournament saved.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="starts_at">Date & Time</Label>
            <Input id="starts_at" type="datetime-local" {...register("starts_at")} />
            {errors.starts_at && (
              <p className="text-xs text-destructive">{errors.starts_at.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee_myr">Fee (MYR)</Label>
            <Input id="fee_myr" type="number" step="0.01" {...register("fee_myr")} />
            {errors.fee_myr && (
              <p className="text-xs text-destructive">{errors.fee_myr.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rules">Rules</Label>
          <Textarea id="rules" rows={4} {...register("rules")} />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Poster</h2>
        <div className="flex items-start gap-4">
          {posterUrl && (
            <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
              <img
                src={posterUrl}
                alt="Tournament poster"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setValue("poster_url", "", { shouldDirty: true })}
                className="absolute top-1 right-1 rounded-md bg-background/80 p-1 text-foreground/60 hover:text-foreground"
              >
                <Trash2Icon className="size-3" />
              </button>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <UploadIcon className="size-4" />
              )}
              {uploading ? "Uploading..." : "Upload poster"}
            </Button>
            <p className="mt-1 text-xs text-foreground/60">JPG, PNG, or WebP. Max 5MB.</p>
          </div>
        </div>
        <input type="hidden" {...register("poster_url")} />
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Registration</h2>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="registration_open"
            className="size-4 rounded border-border-subtle accent-foreground"
            checked={registrationOpen}
            onChange={(e) => setValue("registration_open", e.target.checked)}
          />
          <Label htmlFor="registration_open" className="cursor-pointer">
            Registration open
          </Label>
        </div>
        {registrationOpen && (
          <div className="space-y-2">
            <Label htmlFor="team_registration_url">Team Registration URL</Label>
            <Input
              id="team_registration_url"
              placeholder="https://..."
              {...register("team_registration_url")}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save tournament"
          )}
        </Button>
      </div>
    </form>
  );
}
