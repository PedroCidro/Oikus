import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { getGreeting, getMonthName } from "@/lib/utils";
import { SummaryCards } from "@/components/home/summary-cards";
import { TaskPreview } from "@/components/home/task-preview";
import { Leaderboard } from "@/components/home/leaderboard";
import Link from "next/link";
import type { Perfil, Tarefa, Marca } from "@/lib/supabase/types";

export default async function HomePage() {
  const { user, perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [
    { data: pendingTasks },
    { count: pendingCount },
    { count: marcaCount },
    { data: members },
    { data: allMarcas },
  ] = await Promise.all([
    supabase
      .from("tarefas")
      .select("*")
      .eq("house_id", perfil!.house_id!)
      .eq("status", "pending")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(3)
      .returns<Tarefa[]>(),
    supabase
      .from("tarefas")
      .select("*", { count: "exact", head: true })
      .eq("house_id", perfil!.house_id!)
      .eq("status", "pending"),
    supabase
      .from("marcas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("perfis")
      .select("*")
      .eq("house_id", perfil!.house_id!)
      .returns<Perfil[]>(),
    supabase
      .from("marcas")
      .select("user_id")
      .eq("house_id", perfil!.house_id!)
      .eq("month", month)
      .eq("year", year)
      .returns<Pick<Marca, "user_id">[]>(),
  ]);

  const marcaCounts: Record<string, number> = {};
  allMarcas?.forEach((m) => {
    marcaCounts[m.user_id] = (marcaCounts[m.user_id] || 0) + 1;
  });

  const leaderboard = (members ?? [])
    .map((m) => ({ perfil: m, marcaCount: marcaCounts[m.id] || 0 }))
    .sort((a, b) => b.marcaCount - a.marcaCount);

  const greeting = getGreeting();
  const firstName = perfil?.name?.split(" ")[0] ?? "";

  return (
    <main className="px-5 pt-14 pb-6">
      <p className="text-text-secondary text-[15px]">{greeting},</p>
      <h1 className="font-heading text-[28px] font-bold">{firstName}</h1>

      <div className="mt-6">
        <SummaryCards
          pendingCount={pendingCount ?? 0}
          marcaCount={marcaCount ?? 0}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-[18px] font-semibold">
            Próximas tarefas
          </h2>
          <Link
            href="/tarefas"
            className="text-accent text-[13px] font-semibold"
          >
            Ver todas
          </Link>
        </div>

        {pendingTasks && pendingTasks.length > 0 ? (
          <div className="divide-y divide-surface-dim">
            {pendingTasks.map((task) => (
              <TaskPreview key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-[15px] py-4">
            Nenhuma tarefa pendente
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-[18px] font-semibold">
            Placar do mês
          </h2>
          <Link
            href="/tribunal"
            className="text-accent text-[13px] font-semibold"
          >
            {getMonthName(month)}
          </Link>
        </div>

        <Leaderboard entries={leaderboard} />
      </div>
    </main>
  );
}
