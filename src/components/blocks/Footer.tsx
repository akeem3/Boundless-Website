import Link from "next/link";
import Image from "next/image";
import { buildInstagramLink } from "@/lib/links";
import { INSTAGRAM_URL } from "@/lib/constants/copy";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/blocks/Reveal";

async function getInstagramUrl(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select("instagram_url")
    .eq("id", "singleton")
    .maybeSingle();
  return data?.instagram_url || INSTAGRAM_URL;
}

export async function Footer() {
  const instagramUrl = await getInstagramUrl();

  return (
    <Reveal delay={0}>
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

          <nav className="flex items-center gap-2 sm:gap-6 text-sm text-foreground">
            <Link href="#" className="py-2 px-2 hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="py-2 px-2 hover:text-secondary transition-colors">
              Terms
            </Link>
            <a
              href={buildInstagramLink(instagramUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2 hover:text-secondary transition-colors"
            >
              Instagram
            </a>
          </nav>
        </div>
      </div>
    </footer>
    </Reveal>
  );
}
