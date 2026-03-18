import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { MoradoresClient } from "@/components/moradores/moradores-client";
import type { Perfil, Casa, Marca } from "@/lib/supabase/types";

export default async function MoradoresPage() {
  const { perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const [{ data: house }, { data: members }, { data: marcas }] =
    await Promise.all([
      supabase
        .from("casas")
        .select("*")
        .eq("id", perfil!.house_id!)
        .single<Casa>(),
      supabase
        .from("perfis")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .order("created_at", { ascending: true })
        .returns<Perfil[]>(),
      supabase
        .from("marcas")
        .select("user_id")
        .eq("house_id", perfil!.house_id!)
        .eq("month", new Date().getMonth() + 1)
        .eq("year", new Date().getFullYear())
        .returns<Pick<Marca, "user_id">[]>(),
    ]);

  const marcaCounts: Record<string, number> = {};
  marcas?.forEach((mk) => {
    marcaCounts[mk.user_id] = (marcaCounts[mk.user_id] || 0) + 1;
  });

  return (
    <MoradoresClient
      perfil={perfil!}
      house={house!}
      members={members ?? []}
      marcaCounts={marcaCounts}
    />
  );
}
