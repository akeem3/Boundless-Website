"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

interface MobileNavClientProps {
  items: { label: string; href: string }[];
}

export function MobileNavClient({ items }: MobileNavClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
