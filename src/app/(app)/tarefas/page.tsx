"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FilterChips } from "@/components/ui/filter-chips";
import { TaskRow } from "@/components/tarefas/task-row";
import { CreateTaskModal } from "@/components/tarefas/create-task-modal";
import { Button } from "@/components/ui/button";
import type { Tarefa, Perfil, Casa } from "@/lib/supabase/types";

const FILTERS = ["Todas", "Minhas", "Pendentes", "Feitas"];

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [members, setMembers] = useState<Perfil[]>([]);
  const [filter, setFilter] = useState("Todas");
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState("");
  const [houseId, setHouseId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: perfil } = await supabase
      .from("perfis")
      .select("house_id, role")
      .eq("id", user.id)
      .single<Pick<Perfil, "house_id" | "role">>();

    if (!perfil?.house_id) return;
    setHouseId(perfil.house_id);
    setIsAdmin(perfil.role === "admin");

    const { data: casa } = await supabase
      .from("casas")
      .select("require_approval")
      .eq("id", perfil.house_id)
      .single<Pick<Casa, "require_approval">>();
    setRequireApproval(casa?.require_approval ?? true);

    const { data: allTasks } = await supabase
      .from("tarefas")
      .select("*")
      .eq("house_id", perfil.house_id!)
      .order("due_date", { ascending: true, nullsFirst: false })
      .returns<Tarefa[]>();

    const { data: allMembers } = await supabase
      .from("perfis")
      .select("*")
      .eq("house_id", perfil.house_id!)
      .returns<Perfil[]>();

    setTasks(allTasks ?? []);
    setMembers(allMembers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const filtered = tasks.filter((t) => {
    if (filter === "Minhas") return t.assigned_to === userId;
    if (filter === "Pendentes") return t.status === "pending";
    if (filter === "Feitas") return t.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <main className="px-5 pt-14">
        <p className="text-text-secondary">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-[28px] font-bold">Tarefas</h1>
        <Button onClick={() => setShowModal(true)}>+ Nova</Button>
      </div>

      <FilterChips options={FILTERS} active={filter} onChange={setFilter} />

      <div className="mt-4 divide-y divide-surface-dim">
        {filtered.length > 0 ? (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              assignee={task.assigned_to ? memberMap[task.assigned_to] : null}
              isAdmin={isAdmin}
              requireApproval={requireApproval}
              onUpdate={fetchData}
            />
          ))
        ) : (
          <p className="text-text-secondary text-[15px] py-8 text-center">
            Nenhuma tarefa encontrada
          </p>
        )}
      </div>

      {showModal && (
        <CreateTaskModal
          houseId={houseId}
          members={members}
          userId={userId}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </main>
  );
}
