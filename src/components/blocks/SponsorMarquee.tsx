import { createClient } from "@/lib/supabase/server";

const FALLBACK_SPONSORS = [
  { id: "1", name: "Bangga Malaysia", logo_url: "/logos/BANGGA MALAYSIA.svg" },
  { id: "2", name: "Futspro", logo_url: "/logos/futspro.svg" },
  { id: "3", name: "Pizza Sponsor", logo_url: "/logos/pizza sponsor logo 1.svg" },
  { id: "4", name: "Vida", logo_url: "/logos/vida png 1.svg" },
];

async function getSponsors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsors")
    .select("id, name, logo_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return FALLBACK_SPONSORS;
  }
  return data;
}

function SponsorLogo({ name, logo_url }: { name: string; logo_url: string }) {
  const isVida = name === "Vida";
  return (
    <div className="flex-shrink-0 w-28 sm:w-40 md:w-64 flex items-center justify-center">
      <img
        src={logo_url}
        alt={`${name} logo`}
        className={`${isVida ? "h-12 sm:h-16 md:h-20" : "h-8 sm:h-10 md:h-14"} w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all`}
      />
    </div>
  );
}

export async function SponsorMarquee() {
  const sponsors = await getSponsors();

  return (
    <section role="region" aria-label="Sponsors" className="py-8 border-b border-border-subtle">
      <div className="overflow-hidden">
        <div className="marquee-track">
          <div className="flex items-center gap-8 sm:gap-12 md:gap-24 px-6 sm:px-8 md:px-12">
            {sponsors.map((sponsor) => (
              <SponsorLogo key={sponsor.id} name={sponsor.name} logo_url={sponsor.logo_url} />
            ))}
          </div>
          <div className="flex items-center gap-8 sm:gap-12 md:gap-24 px-6 sm:px-8 md:px-12" aria-hidden="true">
            {sponsors.map((sponsor) => (
              <SponsorLogo key={`dup-${sponsor.id}`} name={sponsor.name} logo_url={sponsor.logo_url} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
