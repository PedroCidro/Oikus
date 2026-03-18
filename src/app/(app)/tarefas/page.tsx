import { getCurrentUser, getSupabase } from "@/lib/supabase/queries";
import { TarefasClient } from "@/components/tarefas/tarefas-client";
import type { Perfil, Tarefa, Casa } from "@/lib/supabase/types";

export default async function TarefasPage() {
  const { user, perfil } = await getCurrentUser();
  const supabase = await getSupabase();

  const [{ data: casa }, { data: allTasks }, { data: allMembers }] =
    await Promise.all([
      supabase
        .from("casas")
        .select("require_approval")
        .eq("id", perfil!.house_id!)
        .single<Pick<Casa, "require_approval">>(),
      supabase
        .from("tarefas")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .order("due_date", { ascending: true, nullsFirst: false })
        .returns<Tarefa[]>(),
      supabase
        .from("perfis")
        .select("*")
        .eq("house_id", perfil!.house_id!)
        .returns<Perfil[]>(),
    ]);

  return (
    <TarefasClient
      tasks={allTasks ?? []}
      members={allMembers ?? []}
      userId={user!.id}
      houseId={perfil!.house_id!}
      isAdmin={perfil!.role === "admin"}
      requireApproval={casa?.require_approval ?? true}
    />
  );
}
