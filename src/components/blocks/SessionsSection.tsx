import { buttonVariants } from "@/components/ui/button";
import {
  SESSIONS_HEADLINE,
  SESSIONS_SUBTITLE,
  SESSIONS_TIME,
  SESSIONS_LOCATION,
  SESSIONS_DESCRIPTION,
} from "@/lib/constants/copy";
import { buildGenericWhatsAppLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

interface SessionSettings {
  session_join_url: string | null;
  whatsapp_number: string;
  whatsapp_generic_message: string;
  whatsapp_find_team_message_template: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
}

async function getSessionSettings(): Promise<SessionSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select(
      "session_join_url, whatsapp_number, whatsapp_generic_message, whatsapp_find_team_message_template, email_address, email_default_subject, instagram_url"
    )
    .eq("id", "singleton")
    .single();
  return data;
}

function DateBlock() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-US", { month: "short" });

  return (
    <div className="flex flex-col items-center justify-center min-w-[72px]">
      <span className="text-4xl font-bold text-foreground leading-none">
        {day}
      </span>
      <span className="text-sm text-secondary uppercase tracking-wide mt-1">
        {month}
      </span>
    </div>
  );
}

export async function SessionsSection() {
  const settings = await getSessionSettings();

  const whatsappLink = settings
    ? buildGenericWhatsAppLink(settings)
    : "#";
  const sessionJoinUrl = settings?.session_join_url ?? "#";

  return (
    <section
      id="sessions"
      aria-labelledby="sessions-headline"
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2
          id="sessions-headline"
          className="text-3xl md:text-4xl text-foreground text-center sm:text-left mb-4"
        >
          {SESSIONS_HEADLINE}
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-10">
          <p className="text-secondary text-center sm:text-left">
            {SESSIONS_SUBTITLE}
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Join the WhatsApp group
          </a>
        </div>

        <div
          className="rounded-lg p-6 md:p-8"
          style={{ border: "0.7px solid var(--border-subtle)" }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <DateBlock />

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-foreground font-medium">{SESSIONS_TIME}</p>
              <p className="text-secondary">{SESSIONS_LOCATION}</p>
              <p className="text-secondary">{SESSIONS_DESCRIPTION}</p>
            </div>

            <div className="w-full sm:w-auto sm:ml-auto">
              <a
                href={sessionJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Join this Session
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
