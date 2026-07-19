import { getContactSettings } from "./actions";
import { ContactEditorClient } from "./contact-editor-client";

export default async function ContactPage() {
  const settings = await getContactSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Contact Settings</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Update WhatsApp, email, Instagram, and session join details.
      </p>
      <div className="mt-6">
        <ContactEditorClient settings={settings} />
      </div>
    </div>
  );
}
