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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveSponsor,
  deleteSponsor,
  uploadSponsorLogo,
  reorderSponsors,
} from "./actions";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  UploadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
} from "lucide-react";

const sponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo_url: z.string().min(1, "Logo is required"),
  sort_order: z.number(),
  active: z.boolean(),
});

type SponsorFormData = z.infer<typeof sponsorSchema>;

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  sort_order: number;
  active: boolean;
}

export function SponsorsEditorClient({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: "",
      logo_url: "",
      sort_order: 0,
      active: true,
    },
  });

  const logoUrl = watch("logo_url");

  function openCreateDialog() {
    setEditingSponsor(null);
    reset({
      name: "",
      logo_url: "",
      sort_order: sponsors.length,
      active: true,
    });
    setDialogOpen(true);
  }

  function openEditDialog(sponsor: Sponsor) {
    setEditingSponsor(sponsor);
    reset({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      sort_order: sponsor.sort_order,
      active: sponsor.active,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: SponsorFormData) {
    setSaving(true);
    const result = await saveSponsor({
      id: editingSponsor?.id,
      ...data,
    });
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(editingSponsor ? "Sponsor updated." : "Sponsor created.");
      setDialogOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this sponsor?")) return;
    setDeleting(id);
    const result = await deleteSponsor(id);
    setDeleting(null);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Sponsor deleted.");
      router.refresh();
    }
  }

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
    const result = await uploadSponsorLogo(file);
    setUploading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result.url) {
      setValue("logo_url", result.url, { shouldDirty: true });
      toast.success("Logo uploaded.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const sorted = [...sponsors].sort((a, b) => a.sort_order - b.sort_order);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    [sorted[index], sorted[newIndex]] = [sorted[newIndex], sorted[index]];
    const ids = sorted.map((s) => s.id);
    await reorderSponsors(ids);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreateDialog}>
          <PlusIcon className="size-4" />
          New sponsor
        </Button>
      </div>

      <div className="space-y-3">
        {sponsors.length === 0 && (
          <p className="text-sm text-foreground/60 text-center py-8">
            No sponsors yet. Add one to get started.
          </p>
        )}
        {[...sponsors]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((sponsor, idx) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-card p-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="size-12 shrink-0 rounded-lg object-contain border border-border-subtle bg-white"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {sponsor.name}
                  </p>
                  {!sponsor.active && (
                    <p className="text-xs text-foreground/40">(inactive)</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                >
                  <ArrowUpIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={idx === sponsors.length - 1}
                  onClick={() => handleMove(idx, "down")}
                >
                  <ArrowDownIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEditDialog(sponsor)}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={deleting === sponsor.id}
                  onClick={() => handleDelete(sponsor.id)}
                >
                  {deleting === sponsor.id ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSponsor ? "Edit sponsor" : "New sponsor"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsor-name">Name</Label>
              <Input id="sponsor-name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
                {logoUrl && (
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-white">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="size-full object-contain"
                    />
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
                    {uploading ? "Uploading..." : "Upload logo"}
                  </Button>
                  <p className="mt-1 text-xs text-foreground/60">
                    PNG, JPG, or SVG. Max 5MB.
                  </p>
                </div>
              </div>
              <input type="hidden" {...register("logo_url")} />
              {errors.logo_url && (
                <p className="text-xs text-destructive">{errors.logo_url.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sponsor-active"
                className="size-4 rounded border-border-subtle accent-foreground"
                checked={watch("active")}
                onChange={(e) => setValue("active", e.target.checked)}
              />
              <Label htmlFor="sponsor-active" className="cursor-pointer">
                Active (visible on site)
              </Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : editingSponsor ? (
                  "Save changes"
                ) : (
                  "Add sponsor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
