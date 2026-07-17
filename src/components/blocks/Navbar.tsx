"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants/nav";
import { SITE_NAME, NAV_CTA_TEXT } from "@/lib/constants/copy";

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-18"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logos/boundless-logo.svg"
            alt={SITE_NAME}
            width={40}
            height={37}
            className="h-10 w-auto"
          />
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex md:items-center md:gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="hidden md:block">
          <Link href="#sessions">
            <Button variant="default" size="sm">
              {NAV_CTA_TEXT}
            </Button>
          </Link>
        </div>

        {/* Mobile: Menu trigger */}
        <Sheet>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-[7px] p-2 text-foreground transition-colors hover:bg-foreground/10 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 sm:max-w-sm p-0 bg-background border-border-subtle">
            <div className="flex flex-col gap-4 p-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="#sessions" className="w-full">
                <Button variant="default" size="sm" className="w-full">
                  {NAV_CTA_TEXT}
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
