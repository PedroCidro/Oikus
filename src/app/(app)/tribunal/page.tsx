import { createClient } from "@/lib/supabase/server";
import { getMonthName } from "@/lib/utils";
import { TribunalCard } from "@/components/tribunal/tribunal-card";
import type { Perfil, Periodo, Marca } from "@/lib/supabase/types";

export default async function TribunalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user!.id)
    .single<Perfil>();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Get threshold from periodos or default to 3
  const { data: periodo } = await supabase
    .from("periodos")
    .select("threshold")
    .eq("house_id", perfil!.house_id!)
    .eq("month", month)
    .eq("year", year)
    .single<Pick<Periodo, "threshold">>();

  const threshold = periodo?.threshold ?? 3;

  // All house members
  const { data: members } = await supabase
    .from("perfis")
    .select("*")
    .eq("house_id", perfil!.house_id!)
    .returns<Perfil[]>();

  // All marcas for this month
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

  const ranked = (members ?? [])
    .map((m) => ({ perfil: m, marcaCount: marcaCounts[m.id] || 0 }))
    .sort((a, b) => b.marcaCount - a.marcaCount);

  return (
    <main className="min-h-dvh bg-dark-bg px-5 pt-14 pb-10">
      <h1 className="font-heading text-[28px] font-bold text-white">
        Tribunal
      </h1>
      <p className="text-[#8B7D6B] text-[15px] mt-1 mb-8">
        {getMonthName(month)} {year} — Limite: {threshold} marcas
      </p>

      <div className="space-y-3">
        {ranked.map((entry, i) => (
          <TribunalCard
            key={entry.perfil.id}
            rank={i + 1}
            perfil={entry.perfil}
            marcaCount={entry.marcaCount}
            threshold={threshold}
          />
        ))}
      </div>

      <p className="text-[#8B7D6B] text-[13px] text-center mt-10 italic">
        Quem passa do limite, paga o churrasco.
      </p>
    </main>
  );
}
