import Link from "next/link";
import Image from "next/image";
import { buildInstagramLink } from "@/lib/links";
import { INSTAGRAM_URL } from "@/lib/constants/copy";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/boundless-logo.svg"
              alt="Boundless FC"
              width={40}
              height={37}
              className="h-10 w-auto"
            />
            <span className="text-sm text-foreground">
              © 2026 Boundless FC
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-foreground">
            <Link href="#" className="hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Terms
            </Link>
            <a
              href={buildInstagramLink(INSTAGRAM_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary transition-colors"
            >
              Instagram
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
