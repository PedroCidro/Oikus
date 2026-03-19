import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { FinancasClient } from "@/components/financas/financas-client";
import type { Perfil, Transacao, EventoFinanceiro } from "@/lib/supabase/types";

export default async function FinancasPage() {
  const { user, perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1 > 12 ? 1 : month + 1).padStart(2, "0")}-01`;

  const [{ data: transacoes }, { data: eventos }, { data: members }] =
    await Promise.all([
      supabase
        .from("transacoes")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .gte("date", startOfMonth)
        .lt("date", endOfMonth)
        .order("date", { ascending: false })
        .returns<Transacao[]>(),
      supabase
        .from("eventos_financeiros")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .order("date", { ascending: false })
        .returns<EventoFinanceiro[]>(),
      supabase
        .from("perfis")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .returns<Perfil[]>(),
    ]);

  return (
    <FinancasClient
      transacoes={transacoes ?? []}
      eventos={eventos ?? []}
      members={members ?? []}
      userId={user!.id}
      houseId={perfil!.house_id!}
      isAdmin={perfil!.role === "admin"}
    />
  );
}
