import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/queries";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only check session cookie (instant, no network call).
  // House check + perfil query happen in getCurrentUser() inside each page,
  // which is wrapped by loading.tsx — so the skeleton shows immediately.
  const supabase = await getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
