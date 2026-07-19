import { getTournament } from "./actions";
import { TournamentEditorClient } from "./tournament-editor-client";

export default async function TournamentPage() {
  const tournament = await getTournament();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Tournament Editor</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Update the active tournament details.
      </p>
      <div className="mt-6">
        <TournamentEditorClient tournament={tournament} />
      </div>
    </div>
  );
}
