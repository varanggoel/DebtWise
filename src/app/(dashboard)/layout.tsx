import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <Navbar user={{ name: session.user.name ?? "", avatar: session.user.image ?? null }} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
