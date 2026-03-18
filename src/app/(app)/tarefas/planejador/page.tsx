import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { getWeekBounds } from "@/lib/utils";
import { PlanejadorClient } from "@/components/planejador/planejador-client";
import { spawnRecurringTasks } from "./actions";
import type { Perfil, Tarefa, CicloExclusao } from "@/lib/supabase/types";

export default async function PlanejadorPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const referenceDate = week ? new Date(week + "T00:00:00") : new Date();
  const { monday, sunday } = getWeekBounds(referenceDate);
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  const [{ data: weekTasks }, { data: allMembers }, { data: recurring }] =
    await Promise.all([
      supabase
        .from("tarefas")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .gte("due_date", mondayStr)
        .lte("due_date", sundayStr)
        .order("due_date", { ascending: true })
        .returns<Tarefa[]>(),
      supabase
        .from("perfis")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .returns<Perfil[]>(),
      supabase
        .from("tarefas")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .eq("is_recurring", true)
        .gte("due_date", mondayStr)
        .lte("due_date", sundayStr)
        .returns<Tarefa[]>(),
    ]);

  // Get exclusions
  const groupIds = (recurring ?? [])
    .map((t) => t.recurrence_group_id)
    .filter(Boolean) as string[];

  let exclusions: CicloExclusao[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("ciclo_exclusoes")
      .select("*")
      .eq("house_id", perfil!.house_id!)
      .in("recurrence_group_id", groupIds)
      .returns<CicloExclusao[]>();
    exclusions = data ?? [];
  }

  // Only spawn next-week instances when viewing the current real week
  const realWeek = getWeekBounds(new Date());
  const isCurrentWeek =
    mondayStr === realWeek.monday.toISOString().split("T")[0];

  if (isCurrentWeek && (recurring ?? []).length > 0) {
    await spawnRecurringTasks(
      perfil!.house_id!,
      (allMembers ?? []).map((m) => m.id)
    );
  }

  // Compute prev/next week strings for navigation
  const prevMonday = new Date(monday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  return (
    <PlanejadorClient
      weekStart={monday}
      prevWeek={prevMonday.toISOString().split("T")[0]}
      nextWeek={nextMonday.toISOString().split("T")[0]}
      tasks={weekTasks ?? []}
      members={allMembers ?? []}
      recurringTasks={recurring ?? []}
      exclusions={exclusions}
      houseId={perfil!.house_id!}
      isAdmin={perfil!.role === "admin"}
    />
  );
}
