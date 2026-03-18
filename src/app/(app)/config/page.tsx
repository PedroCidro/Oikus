import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { ConfigClient } from "@/components/config/config-client";
import type { Casa, Periodo } from "@/lib/supabase/types";

export default async function ConfigPage() {
  const { perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const now = new Date();
  const [{ data: house }, { data: periodo }] = await Promise.all([
    supabase
      .from("casas")
      .select("*")
      .eq("id", perfil!.house_id!)
      .single<Casa>(),
    supabase
      .from("periodos")
      .select("threshold")
      .eq("house_id", perfil!.house_id!)
      .eq("month", now.getMonth() + 1)
      .eq("year", now.getFullYear())
      .single<Pick<Periodo, "threshold">>(),
  ]);

  return (
    <ConfigClient
      perfil={perfil!}
      initialHouse={house}
      initialThreshold={periodo?.threshold ?? 3}
    />
  );
}
