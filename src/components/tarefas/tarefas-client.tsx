"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilterChips } from "@/components/ui/filter-chips";
import { TaskRow } from "@/components/tarefas/task-row";
import { CreateTaskModal } from "@/components/tarefas/create-task-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMonthName } from "@/lib/utils";
import type { Tarefa, Perfil } from "@/lib/supabase/types";

const FILTERS = ["Todas", "Minhas", "Pendentes", "Feitas"];

export function TarefasClient({
  tasks,
  members,
  userId,
  houseId,
  isAdmin,
  requireApproval,
}: {
  tasks: Tarefa[];
  members: Perfil[];
  userId: string;
  houseId: string;
  isAdmin: boolean;
  requireApproval: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("Todas");
  const [showModal, setShowModal] = useState(false);

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const filtered = tasks.filter((t) => {
    if (filter === "Minhas") return t.assigned_to === userId;
    if (filter === "Pendentes") return t.status === "pending";
    if (filter === "Feitas") return t.status === "completed";
    return true;
  });

  return (
    <main className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-[28px] font-bold">Tarefas</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/tarefas/planejador"
            className="text-accent text-[13px] font-semibold"
          >
            Planejador
          </Link>
          <Button onClick={() => setShowModal(true)}>+ Nova</Button>
        </div>
      </div>

      <MonthProgress tasks={tasks} />

      <FilterChips options={FILTERS} active={filter} onChange={setFilter} />

      <div className="mt-4 divide-y divide-surface-dim">
        {filtered.length > 0 ? (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              assignees={
                task.assigned_pool && task.assigned_pool.length > 0
                  ? task.assigned_pool
                      .map((id) => memberMap[id])
                      .filter(Boolean)
                  : task.assigned_to && memberMap[task.assigned_to]
                    ? [memberMap[task.assigned_to]]
                    : []
              }
              isAdmin={isAdmin}
              requireApproval={requireApproval}
              onUpdate={() => router.refresh()}
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
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}

function MonthProgress({ tasks }: { tasks: Tarefa[] }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const monthTasks = tasks.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const total = monthTasks.length;
  if (total === 0) return null;

  const completed = monthTasks.filter((t) => t.status === "completed").length;
  const pct = total > 0 ? completed / total : 0;

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysPct = now.getDate() / daysInMonth;

  return (
    <div className="bg-surface rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-text-secondary">
          {getMonthName(month)}
        </span>
        <span className="text-[13px] font-bold">
          {completed}/{total} tarefas
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-dim overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 border-r-2 border-text-secondary/30"
          style={{ width: `${daysPct * 100}%` }}
        />
        <div
          className={`h-full rounded-full transition-all relative z-10 ${
            pct >= 1
              ? "bg-success"
              : pct >= 0.5
                ? "bg-accent"
                : "bg-warning"
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-text-secondary">
          {Math.round(pct * 100)}% concluído
        </span>
        <span className="text-[11px] text-text-secondary">
          Dia {now.getDate()}/{daysInMonth}
        </span>
      </div>
    </div>
  );
}
