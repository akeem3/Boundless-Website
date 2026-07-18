"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants/nav";
import { SITE_NAME, NAV_CTA_TEXT } from "@/lib/constants/copy";

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur h-14 md:h-18"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logos/boundless-logo.svg"
            alt={SITE_NAME}
            width={56}
            height={52}
            className="h-10 md:h-16 w-auto"
          />
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex md:items-center md:gap-8 flex-1 justify-center">
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
        <div className="hidden md:block shrink-0">
          <Link href="#sessions">
            <Button variant="default" size="sm">
              {NAV_CTA_TEXT}
            </Button>
          </Link>
        </div>

        {/* Mobile: Menu trigger */}
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-[7px] p-2.5 text-foreground transition-colors hover:bg-foreground/10 min-h-[44px] min-w-[44px]"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 sm:max-w-sm p-0 bg-background border-border-subtle"
          >
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
      </div>
    </nav>
  );
}
