import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ABOUT_HEADLINE, ABOUT_BODY, ABOUT_STATS, ABOUT_READ_MORE_URL } from "@/lib/constants/copy";
import { Reveal } from "@/components/blocks/Reveal";

export function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-center">
          {/* Text Column */}
          <div className="md:col-span-5">
            <Reveal delay={0}>
              <h2 className="text-3xl md:text-4xl text-foreground mb-6">
                {ABOUT_HEADLINE}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-secondary leading-relaxed mb-8">
                {ABOUT_BODY}{" "}
                <a
                  href={ABOUT_READ_MORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent font-semibold hover:underline underline-offset-4"
                >
                  Read more
                  <ArrowUpRight className="size-4" />
                </a>
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {ABOUT_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl sm:text-3xl text-foreground">{stat.value}</div>
                    <div className="text-sm text-secondary">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Image Column */}
          <Reveal
            delay={0.15}
            className="md:col-span-7 relative aspect-[16/10] rounded-lg overflow-hidden"
            style={{ border: "0.7px solid var(--border-subtle)" }}
          >
            <Image
              src="/about-community.jpeg"
              alt="Boundless FC community gathering"
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
