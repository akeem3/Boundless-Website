import Link from "next/link";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Tournament", href: "/admin/tournament" },
  { label: "Sessions", href: "/admin/sessions" },
  { label: "Shop", href: "/admin/shop" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Contact", href: "/admin/contact" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border-subtle md:sticky md:top-0 md:h-screen">
        <div className="flex h-14 items-center border-b border-border-subtle px-6">
          <Link href="/admin" className="text-base font-semibold text-foreground">
            Boundless FC — Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border-subtle p-4">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border-subtle px-4 md:px-6">
          <MobileNav items={NAV_ITEMS} />
          <Link href="/" className="text-sm text-foreground/60 hover:text-foreground" target="_blank">
            View site ↗
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({ items }: { items: typeof NAV_ITEMS }) {
  return (
    <div className="md:hidden">
      <MobileNavSheet items={items} />
    </div>
  );
}

async function MobileNavSheet({ items }: { items: typeof NAV_ITEMS }) {
  const { MobileNavClient } = await import("./mobile-nav-client");
  return <MobileNavClient items={items} />;
}
