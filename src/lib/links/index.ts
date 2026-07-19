interface ContactSettings {
  whatsapp_number: string;
  whatsapp_generic_message: string;
  whatsapp_find_team_message_template: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
}

export function buildWhatsAppLink(
  number: string,
  message: string
): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export function buildMailtoLink(
  email: string,
  subject: string
): string {
  const encoded = encodeURIComponent(subject);
  return `mailto:${email}?subject=${encoded}`;
}

export function buildFindTeamLink(
  contact: ContactSettings,
  tournamentTitle: string
): string {
  const message = contact.whatsapp_find_team_message_template.replaceAll(
    "{tournament_title}",
    tournamentTitle
  );
  return buildWhatsAppLink(contact.whatsapp_number, message);
}

export function buildGenericWhatsAppLink(contact: ContactSettings): string {
  return buildWhatsAppLink(
    contact.whatsapp_number,
    contact.whatsapp_generic_message
  );
}

export function buildEmailLink(contact: ContactSettings): string {
  return buildMailtoLink(
    contact.email_address,
    contact.email_default_subject
  );
}

export function buildInstagramLink(url: string): string {
  return url;
}

export function buildProductOrderLink(
  productOrderUrl: string | null,
  shopOrderUrl: string
): string | null {
  return productOrderUrl || shopOrderUrl || null;
}
