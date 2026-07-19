"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmit />
    </form>
  );
}

function LogoutSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="w-full justify-start gap-2"
    >
      <LogOutIcon className="size-4" />
      {pending ? "Logging out..." : "Log out"}
    </Button>
  );
}
