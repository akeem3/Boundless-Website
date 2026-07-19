import { getSessions } from "./actions";
import { SessionsEditorClient } from "./sessions-editor-client";

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Sessions Editor</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Create and manage weekly session schedule.
      </p>
      <div className="mt-6">
        <SessionsEditorClient sessions={sessions} />
      </div>
    </div>
  );
}
