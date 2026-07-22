import { Navbar } from "@/components/blocks/Navbar";
import { CinemaProvider } from "@/lib/cinema-context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CinemaProvider>
      <Navbar />
      <main>{children}</main>
    </CinemaProvider>
  );
}