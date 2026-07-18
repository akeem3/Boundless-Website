const SPONSOR_LOGOS = [
  { id: "1", name: "Bangga Malaysia", logoUrl: "/logos/BANGGA MALAYSIA.svg" },
  { id: "2", name: "Futspro", logoUrl: "/logos/futspro.svg" },
  { id: "3", name: "Pizza Sponsor", logoUrl: "/logos/pizza sponsor logo 1.svg" },
  { id: "4", name: "Vida", logoUrl: "/logos/vida png 1.svg" },
];

function SponsorLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  const isVida = name === "Vida";
  return (
    <div className="flex-shrink-0 w-28 sm:w-40 md:w-64 flex items-center justify-center">
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${isVida ? "h-12 sm:h-16 md:h-20" : "h-8 sm:h-10 md:h-14"} w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all`}
      />
    </div>
  );
}

export function SponsorMarquee() {
  return (
    <section role="region" aria-label="Sponsors" className="py-8 border-b border-border-subtle">
      <div className="overflow-hidden">
        <div className="marquee-track">
          {/* Original set */}
          <div className="flex items-center gap-8 sm:gap-12 md:gap-24 px-6 sm:px-8 md:px-12">
            {SPONSOR_LOGOS.map((logo) => (
              <SponsorLogo key={logo.id} {...logo} />
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-8 sm:gap-12 md:gap-24 px-6 sm:px-8 md:px-12" aria-hidden="true">
            {SPONSOR_LOGOS.map((logo) => (
              <SponsorLogo key={`dup-${logo.id}`} {...logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
