import { buttonVariants } from "@/components/ui/button";
import {
  SESSIONS_HEADLINE,
  SESSIONS_SUBTITLE,
  SESSIONS_DESCRIPTION,
} from "@/lib/constants/copy";
import { createClient } from "@/lib/supabase/server";

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

function DateBlock({ date }: { date: Date }) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });

  return (
    <div className="flex flex-col items-center justify-center min-w-18">
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
        <h2
          id="sessions-headline"
          className="text-2xl sm:text-3xl md:text-4xl text-foreground text-center sm:text-left mb-4"
        >
          {SESSIONS_HEADLINE}
        </h2>

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

        <div className="space-y-4">
          {sessionsData.map((session) => {
            const sessionDate = new Date(session.starts_at);
            const sessionTime = sessionDate.toLocaleString("en-GB", {
              weekday: "long",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Kuala_Lumpur",
            });
            const sessionLocation = session.location;
            const sessionDescription = session.note ?? SESSIONS_DESCRIPTION;
            const sessionUrl = session.join_url ?? "#";

            return (
              <div
                key={session.id}
                className="rounded-lg p-5 sm:p-6 md:p-8"
                style={{ border: "0.7px solid var(--border-subtle)" }}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <DateBlock date={sessionDate} />

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-foreground font-medium">{sessionTime}</p>
                    <p className="text-secondary">{sessionLocation}</p>
                    <p className="text-secondary">{sessionDescription}</p>
                  </div>

                  <div className="w-full sm:w-auto sm:ml-auto">
                    <a
                      href={sessionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonVariants({ variant: "default", size: "lg" })} w-full sm:w-auto text-center`}
                    >
                      Join this Session
                    </a>
                  </div>
                </div>
              </div>
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
