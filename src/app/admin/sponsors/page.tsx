import { getSponsors } from "./actions";
import { SponsorsEditorClient } from "./sponsors-editor-client";

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Sponsors Editor</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Manage sponsor logos and ordering.
      </p>
      <div className="mt-6">
        <SponsorsEditorClient sponsors={sponsors} />
      </div>
    </div>
  );
}
