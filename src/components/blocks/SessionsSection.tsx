import { buttonVariants } from "@/components/ui/button";
import {
  SESSIONS_HEADLINE,
  SESSIONS_SUBTITLE,
  SESSIONS_DESCRIPTION,
} from "@/lib/constants/copy";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/blocks/Reveal";
import { SessionCardClient } from "@/components/blocks/SessionCardClient";

interface SessionSettings {
  whatsapp_group_url: string | null;
}

interface Session {
  id: string;
  starts_at: string;
  location: string;
  note: string | null;
  join_url: string | null;
}

async function getSessionSettings(): Promise<SessionSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select("whatsapp_group_url")
    .eq("id", "singleton")
    .single();
  return data;
}

async function getUpcomingSessions(): Promise<Session[]> {
  const supabase = await createClient();

  const { data: upcoming } = await supabase
    .from("sessions")
    .select("id, starts_at, location, note, join_url")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(3);

  if (upcoming && upcoming.length > 0) return upcoming;

  const { data: latest } = await supabase
    .from("sessions")
    .select("id, starts_at, location, note, join_url")
    .order("starts_at", { ascending: false })
    .limit(3);

  return latest ?? [];
}

export async function SessionsSection() {
  const [settings, sessions] = await Promise.all([
    getSessionSettings(),
    getUpcomingSessions(),
  ]);

  const whatsappLink = settings?.whatsapp_group_url ?? "#";
  const sessionsData = sessions;

  return (
    <section
      id="sessions"
      aria-labelledby="sessions-headline"
      className="py-12 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Reveal delay={0}>
          <h2
            id="sessions-headline"
            className="text-2xl sm:text-3xl md:text-4xl text-foreground text-center sm:text-left mb-4"
          >
            {SESSIONS_HEADLINE}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <p className="text-secondary text-center sm:text-left">
              {SESSIONS_SUBTITLE}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonVariants({ variant: "ghost", size: "lg" })} w-full sm:w-auto text-center`}
            >
              Join the WhatsApp group
            </a>
          </div>
        </Reveal>

        <div className="space-y-4">
          {sessionsData.map((session, index) => {
            const sessionDescription = session.note ?? SESSIONS_DESCRIPTION;

            return (
              <SessionCardClient
                key={session.id}
                session={session}
                description={sessionDescription}
                index={index}
              />
            );
          })}

          {sessionsData.length === 0 && (
            <p className="text-secondary text-center py-8">
              No upcoming sessions. Check back soon!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
