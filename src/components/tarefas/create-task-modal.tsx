"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Perfil } from "@/lib/supabase/types";

export function CreateTaskModal({
  houseId,
  members,
  userId,
  onClose,
  onCreated,
}: {
  houseId: string;
  members: Perfil[];
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.from("tarefas").insert({
      house_id: houseId,
      title,
      description: description || null,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      created_by: userId,
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar tarefa"}
          </Button>
        </form>
      </div>
    </div>
  );
}
