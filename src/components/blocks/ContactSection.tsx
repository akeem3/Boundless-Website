import { Phone, Mail, AtSign } from "lucide-react";
import {
  CONTACT_HEADLINE,
  CONTACT_SUBTITLE,
  CONTACT_WHATSAPP_LABEL,
  CONTACT_EMAIL_LABEL,
  CONTACT_INSTAGRAM_LABEL,
} from "@/lib/constants/copy";
import {
  buildGenericWhatsAppLink,
  buildEmailLink,
  buildInstagramLink,
} from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

interface ContactSettings {
  whatsapp_number: string;
  whatsapp_generic_message: string;
  whatsapp_find_team_message_template: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
}

async function getContactSettings(): Promise<ContactSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select(
      "whatsapp_number, whatsapp_generic_message, whatsapp_find_team_message_template, email_address, email_default_subject, instagram_url"
    )
    .eq("id", "singleton")
    .single();
  return data;
}

interface ContactCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  href: string;
}

function ContactCard({ icon: Icon, label, detail, href }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center text-center p-6 rounded-lg transition-colors hover:bg-accent/5"
      style={{ border: "0.7px solid var(--border-subtle)" }}
    >
      <Icon className="size-8 text-secondary mb-4 group-hover:text-foreground transition-colors" />
      <h3 className="text-foreground font-medium mb-1">{label}</h3>
      <p className="text-secondary text-sm">{detail}</p>
    </a>
  );
}

export async function ContactSection() {
  const settings = await getContactSettings();

  const whatsappLink = settings ? buildGenericWhatsAppLink(settings) : "#";
  const emailLink = settings ? buildEmailLink(settings) : "#";
  const instagramLink = settings
    ? buildInstagramLink(settings.instagram_url)
    : "#";

  const whatsappDetail = settings?.whatsapp_number ?? "WhatsApp us";
  const emailDetail = settings?.email_address ?? "Email us";
  const instagramDetail = settings?.instagram_url
    ? settings.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")
    : "@boundlessfc";

  return (
    <section
      id="contact"
      aria-labelledby="contact-headline"
      className="py-16 md:py-24 border-t border-border-subtle"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="contact-headline"
          className="text-3xl md:text-4xl text-foreground mb-4 text-center"
        >
          {CONTACT_HEADLINE}
        </h2>
        <p className="text-secondary mb-10 text-center">{CONTACT_SUBTITLE}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ContactCard
            icon={Phone}
            label={CONTACT_WHATSAPP_LABEL}
            detail={whatsappDetail}
            href={whatsappLink}
          />
          <ContactCard
            icon={Mail}
            label={CONTACT_EMAIL_LABEL}
            detail={emailDetail}
            href={emailLink}
          />
          <ContactCard
            icon={AtSign}
            label={CONTACT_INSTAGRAM_LABEL}
            detail={instagramDetail}
            href={instagramLink}
          />
        </div>
      </div>
    </section>
  );
}
