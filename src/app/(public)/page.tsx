import { HeroSection } from "@/components/blocks/HeroSection";
import { SponsorMarquee } from "@/components/blocks/SponsorMarquee";
import { SessionsSection } from "@/components/blocks/SessionsSection";
import { TournamentSection } from "@/components/blocks/TournamentSection";
import { ShopSection } from "@/components/blocks/ShopSection";
import { AboutSection } from "@/components/blocks/AboutSection";
import { ContactSection } from "@/components/blocks/ContactSection";
import { Footer } from "@/components/blocks/Footer";
import { createClient } from "@/lib/supabase/server";

async function getTournamentTitle(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.title ?? null;
}

export default async function Home() {
  const tournamentTitle = await getTournamentTitle();

  return (
    <>
      <HeroSection tournamentTitle={tournamentTitle} />
      <SponsorMarquee />
      <SessionsSection />
      <TournamentSection />
      <ShopSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </>
  );
}
