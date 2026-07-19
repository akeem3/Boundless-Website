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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createSession,
  updateSession,
  deleteSession,
} from "./actions";
import { PlusIcon, PencilIcon, Trash2Icon, Loader2Icon } from "lucide-react";

const sessionSchema = z.object({
  starts_at: z.string().min(1, "Date & time is required"),
  location: z.string().min(1, "Location is required"),
  note: z.string().optional(),
  capacity: z.string().min(1, "Capacity is required"),
  join_url: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface Session {
  id: string;
  starts_at: string;
  location: string;
  note: string | null;
  capacity: number;
  spots_taken: number;
  join_url: string | null;
}

export function SessionsEditorClient({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      starts_at: "",
      location: "",
      note: "",
      capacity: "20",
    },
  });

  function openCreateDialog() {
    setEditingSession(null);
    reset({ starts_at: "", location: "", note: "", capacity: "20", join_url: "" });
    setDialogOpen(true);
  }

  function openEditDialog(session: Session) {
    setEditingSession(session);
    reset({
      starts_at: new Date(session.starts_at).toISOString().slice(0, 16),
      location: session.location,
      note: session.note ?? "",
      capacity: String(session.capacity),
      join_url: session.join_url ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: SessionFormData) {
    setSaving(true);
    const payload = {
      starts_at: data.starts_at,
      location: data.location,
      note: data.note ?? "",
      capacity: Number(data.capacity),
      join_url: data.join_url ?? "",
    };
    const result = editingSession
      ? await updateSession(editingSession.id, payload)
      : await createSession(payload);
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(editingSession ? "Session updated." : "Session created.");
      setDialogOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteSession(id);
    setDeleting(null);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Session deleted.");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreateDialog}>
          <PlusIcon className="size-4" />
          New session
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="text-sm text-foreground/60 text-center py-8">
            No sessions yet. Create one to get started.
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {new Date(session.starts_at).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kuala_Lumpur",
                })}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">
                {session.location}
                {session.note && ` — ${session.note}`}
              </p>
              <p className="text-xs text-foreground/60">
                {session.spots_taken}/{session.capacity} spots taken
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEditDialog(session)}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={deleting === session.id}
                onClick={() => handleDelete(session.id)}
              >
                {deleting === session.id ? (
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
              {editingSession ? "Edit session" : "New session"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-starts_at">Date & Time</Label>
              <Input id="session-starts_at" type="datetime-local" {...register("starts_at")} />
              {errors.starts_at && (
                <p className="text-xs text-destructive">{errors.starts_at.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-location">Location</Label>
              <Input id="session-location" {...register("location")} />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-note">Note (optional)</Label>
              <Textarea id="session-note" rows={2} {...register("note")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-join_url">Join Session URL (optional)</Label>
              <Input
                id="session-join_url"
                placeholder="https://forms.google.com/..."
                {...register("join_url")}
              />
              <p className="text-xs text-foreground/60">
                Custom link for this session's CTA button. Falls back to global setting if empty.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-capacity">Capacity</Label>
              <Input id="session-capacity" type="number" min={1} {...register("capacity")} />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : editingSession ? (
                  "Save changes"
                ) : (
                  "Create session"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
