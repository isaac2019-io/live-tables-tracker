import { AppNav } from "@/components/app-nav";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(245,96,32,0.32),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(29,78,216,0.35),transparent_24%),linear-gradient(135deg,#05060a_0%,#101524_46%,#05060a_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
      <AppNav user={session} />
      <main>{children}</main>
    </div>
  );
}
