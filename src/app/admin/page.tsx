import Link from "next/link";
import {
  TrophyIcon,
  CalendarIcon,
  ShoppingBagIcon,
  StarIcon,
  PhoneIcon,
} from "lucide-react";

const EDITORS = [
  {
    label: "Tournament",
    href: "/admin/tournament",
    description: "Edit the upcoming tournament details, poster, and registration.",
    icon: TrophyIcon,
  },
  {
    label: "Sessions",
    href: "/admin/sessions",
    description: "Create and manage weekly session schedule.",
    icon: CalendarIcon,
  },
  {
    label: "Shop",
    href: "/admin/shop",
    description: "Manage products, images, and pricing.",
    icon: ShoppingBagIcon,
  },
  {
    label: "Sponsors",
    href: "/admin/sponsors",
    description: "Update sponsor logos and ordering.",
    icon: StarIcon,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    description: "Update WhatsApp, email, and Instagram details.",
    icon: PhoneIcon,
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Select a section to edit.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EDITORS.map((editor) => (
          <Link
            key={editor.href}
            href={editor.href}
            className="group rounded-xl border border-border-subtle bg-card p-5 transition-colors hover:bg-card/80"
          >
            <editor.icon className="size-5 text-foreground/60 group-hover:text-foreground" />
            <h2 className="mt-3 text-base font-medium text-foreground">
              {editor.label}
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              {editor.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
