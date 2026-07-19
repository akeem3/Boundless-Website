import { Calendar, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  TOURNAMENTS_HEADLINE,
  TOURNAMENTS_CTA_JOIN,
  TOURNAMENTS_CTA_FIND,
  TOURNAMENTS_CTA_MICROCOPY,
} from "@/lib/constants/copy";
import { buildFindTeamLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

interface Tournament {
  title: string;
  starts_at: string;
  location: string;
  fee_myr: number;
  description: string | null;
  poster_url: string | null;
  team_registration_url: string | null;
}

interface ContactSettings {
  whatsapp_number: string;
  whatsapp_find_team_message_template: string;
  whatsapp_generic_message: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
}

async function getLatestTournament(): Promise<Tournament | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select(
      "title, starts_at, location, fee_myr, description, poster_url, team_registration_url"
    )
    .eq("registration_open", true)
    .order("starts_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getContactSettings(): Promise<ContactSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select(
      "whatsapp_number, whatsapp_find_team_message_template, whatsapp_generic_message, email_address, email_default_subject, instagram_url"
    )
    .eq("id", "singleton")
    .single();
  return data;
}

const TZ = "Asia/Kuala_Lumpur";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });
}

function formatFee(fee: number): string {
  return `RM${fee} per team`;
}

function DetailRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-6 text-foreground shrink-0" />
      <span className="text-foreground text-lg">{text}</span>
    </div>
  );
}

export async function TournamentSection() {
  const [tournament, contact] = await Promise.all([
    getLatestTournament(),
    getContactSettings(),
  ]);

  const findTeamLink =
    contact && tournament
      ? buildFindTeamLink(contact, tournament.title)
      : "#";

  const registerUrl = tournament?.team_registration_url ?? "#";

  const dateStr = tournament ? formatDate(tournament.starts_at) : "";
  const timeStr = tournament ? formatTime(tournament.starts_at) : "";
  const dateTimeStr = tournament ? `${dateStr} · ${timeStr}` : "";
  const feeStr = tournament ? formatFee(tournament.fee_myr) : "";

  return (
    <section
      id="tournaments"
      aria-labelledby="tournaments-headline"
      className="border border-border-subtle py-16 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* Left Column — Text Content */}
          <div className="md:col-span-7 order-2 md:order-1">
            <h2
              id="tournaments-headline"
              className="text-3xl md:text-4xl text-foreground font-semibold mb-8"
            >
              {TOURNAMENTS_HEADLINE}
            </h2>

            {tournament ? (
              <>
                <h3 className="text-3xl md:text-4xl lg:text-5xl text-foreground font-semibold leading-tight mb-10">
                  {tournament.title}
                </h3>

                <div className="space-y-5 mb-10">
                  <DetailRow icon={Calendar} text={dateTimeStr} />
                  <DetailRow icon={MapPin} text={tournament.location} />
                  <DetailRow icon={Ticket} text={feeStr} />
                </div>

                {tournament.description && (
                  <p className="text-secondary text-sm leading-relaxed mb-10">
                    {tournament.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <a
                    href={registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "default", size: "lg" })}
                  >
                    {TOURNAMENTS_CTA_JOIN}
                  </a>
                  <a
                    href={findTeamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "lg" })}
                  >
                    {TOURNAMENTS_CTA_FIND}
                  </a>
                </div>

                <p className="text-secondary/70 text-xs leading-relaxed">
                  {TOURNAMENTS_CTA_MICROCOPY}
                </p>
              </>
            ) : (
              <p className="text-secondary">
                Our biggest tournament yet. 40+ nationalities, one pitch.
              </p>
            )}
          </div>

          {/* Right Column — Poster Image */}
          <div className="md:col-span-5 order-1 md:order-2">
            <div className="relative aspect-7/9 rounded-[15px] overflow-hidden border-[1.26px] border-border-subtle">
              {tournament?.poster_url ? (
                <Image
                  src={tournament.poster_url}
                  alt={tournament.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-secondary text-sm">
                    Tournament poster coming soon
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
