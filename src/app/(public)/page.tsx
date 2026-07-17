import { HeroSection } from "@/components/blocks/HeroSection";
import { SponsorMarquee } from "@/components/blocks/SponsorMarquee";
import { SessionsSection } from "@/components/blocks/SessionsSection";
import { TournamentSection } from "@/components/blocks/TournamentSection";
import { ShopSection } from "@/components/blocks/ShopSection";
import { AboutSection } from "@/components/blocks/AboutSection";
import { ContactSection } from "@/components/blocks/ContactSection";
import { Footer } from "@/components/blocks/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
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