import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <main className="max-w-lg mx-auto pb-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
