"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants/nav";
import { SITE_NAME, NAV_CTA_TEXT } from "@/lib/constants/copy";
import { scrollToSection } from "@/lib/scroll-to";

export function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(
    scrollY,
    [0, 300],
    ["rgba(21,31,43,0)", "rgba(21,31,43,0.95)"]
  );

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full backdrop-blur h-14 md:h-18"
      style={{ backgroundColor: navBg }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(null);
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <Image
            src="/logos/boundless-logo.svg"
            alt={SITE_NAME}
            width={56}
            height={52}
            className="h-10 md:h-16 w-auto"
          />
        </a>

        {/* Center: Nav links */}
        <div className="hidden md:flex md:items-center md:gap-8 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="hidden md:block shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={() => scrollToSection("#sessions")}
          >
            {NAV_CTA_TEXT}
          </Button>
        </div>

        {/* Mobile: Menu trigger */}
        <div className="ml-auto md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setSheetOpen(false);
                    scrollToSection(link.href);
                  }}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSheetOpen(false);
                  scrollToSection("#sessions");
                }}
              >
                {NAV_CTA_TEXT}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
