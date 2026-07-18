import Image from "next/image";
import { ABOUT_HEADLINE, ABOUT_BODY, ABOUT_STATS } from "@/lib/constants/copy";

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          {/* Text Column */}
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-4xl text-foreground mb-6">
              {ABOUT_HEADLINE}
            </h2>
            <p className="text-secondary leading-relaxed mb-8">{ABOUT_BODY}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {ABOUT_STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl text-foreground">{stat.value}</div>
                  <div className="text-sm text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Column */}
          <div
            className="md:col-span-7 relative aspect-[16/10] rounded-lg overflow-hidden"
            style={{ border: "0.7px solid var(--border-subtle)" }}
          >
            <Image
              src="/about-community.jpeg"
              alt="Boundless FC community gathering"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
