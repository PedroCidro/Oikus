"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { getMemberColor } from "@/lib/utils";
import type { Perfil } from "@/lib/supabase/types";

export function CreateTaskModal({
  houseId,
  members,
  userId,
  isAdmin,
  onClose,
  onCreated,
}: {
  houseId: string;
  members: Perfil[];
  userId: string;
  isAdmin: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedPool, setAssignedPool] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [cycleMembers, setCycleMembers] = useState(false);
  const [loading, setLoading] = useState(false);

  const showPool = isAdmin;

  function togglePoolMember(id: string) {
    setAssignedPool((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const pool = assignedPool.length > 0 ? assignedPool : assignedTo ? [assignedTo] : [];
    const firstAssignee = pool.length > 0 ? pool[0] : null;

    const supabase = createClient();
    await supabase.from("tarefas").insert({
      house_id: houseId,
      title,
      description: description || null,
      assigned_to: firstAssignee,
      assigned_pool: pool,
      due_date: dueDate || null,
      created_by: userId,
      is_recurring: isRecurring,
      recurrence_group_id: isRecurring ? crypto.randomUUID() : null,
      cycle_members: isRecurring && cycleMembers,
    });

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-[18px] font-semibold">
            Nova tarefa
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-[20px]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Título
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
              placeholder="O que precisa ser feito?"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors resize-none"
              rows={3}
              placeholder="Detalhes opcionais..."
            />
          </div>

          {showPool ? (
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Responsáveis
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => {
                  const selected = assignedPool.includes(m.id);
                  const color = getMemberColor(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => togglePoolMember(m.id)}
                      className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 transition-all ${
                        selected
                          ? "bg-surface-dim"
                          : "bg-surface opacity-50"
                      }`}
                    >
                      <div
                        style={{ backgroundColor: color }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                      >
                        <span className="text-[11px] font-bold text-white">
                          {m.name[0]}
                        </span>
                      </div>
                      <span className="text-[13px] font-medium">
                        {m.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Responsável
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
              >
                <option value="">Ninguém</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Data limite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
            />
          </div>

          {isAdmin && (
            <div className="space-y-3 pt-2 border-t border-surface-dim">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">Repete semanalmente</span>
                <Toggle checked={isRecurring} onChange={setIsRecurring} />
              </div>
              {isRecurring && (
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium">Revezar os membros</span>
                  <Toggle checked={cycleMembers} onChange={setCycleMembers} />
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar tarefa"}
          </Button>
        </form>
      </div>
    </div>
  );
}
