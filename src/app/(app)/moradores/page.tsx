import { createClient } from "@/lib/supabase/server";
import { HouseInfoCard } from "@/components/moradores/house-info-card";
import { MemberRow } from "@/components/moradores/member-row";
import type { Perfil, Casa, Marca } from "@/lib/supabase/types";

export default async function MoradoresPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user!.id)
    .single<Perfil>();

  const { data: house } = await supabase
    .from("casas")
    .select("*")
    .eq("id", perfil!.house_id!)
    .single<Casa>();

  const { data: members } = await supabase
    .from("perfis")
    .select("*")
    .eq("house_id", perfil!.house_id!)
    .order("created_at", { ascending: true })
    .returns<Perfil[]>();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: marcas } = await supabase
    .from("marcas")
    .select("user_id")
    .eq("house_id", perfil!.house_id!)
    .eq("month", month)
    .eq("year", year)
    .returns<Pick<Marca, "user_id">[]>();

  const marcaCounts: Record<string, number> = {};
  marcas?.forEach((m) => {
    marcaCounts[m.user_id] = (marcaCounts[m.user_id] || 0) + 1;
  });

  return (
    <main className="px-5 pt-14 pb-6">
      <h1 className="font-heading text-[28px] font-bold mb-6">Moradores</h1>

      <HouseInfoCard
        houseName={house!.name}
        inviteCode={house!.invite_code}
        memberCount={members?.length ?? 0}
      />

      <h2 className="font-heading text-[18px] font-semibold mb-3">
        Membros
      </h2>

      <div className="divide-y divide-surface-dim">
        {members?.map((m) => (
          <MemberRow
            key={m.id}
            perfil={m}
            marcaCount={marcaCounts[m.id] || 0}
          />
        ))}
      </div>
    </main>
  );
}
