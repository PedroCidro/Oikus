"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Perfil, EventoFinanceiro } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "gastos", label: "Gastos" },
  { value: "fornecedores", label: "Fornecedores" },
  { value: "lucro", label: "Lucro" },
  { value: "pessoas", label: "Pessoas" },
];

export function CreateTransactionModal({
  houseId,
  userId,
  members,
  eventos,
  onClose,
  onCreated,
}: {
  houseId: string;
  userId: string;
  members: Perfil[];
  eventos: EventoFinanceiro[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("gastos");
  const [responsibleId, setResponsibleId] = useState(userId);
  const [eventoId, setEventoId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("transacoes").insert({
      house_id: houseId,
      type: type as "entrada" | "saida",
      amount: parseFloat(amount),
      description,
      category: category as "gastos" | "fornecedores" | "lucro" | "pessoas",
      responsible_id: responsibleId,
      evento_id: eventoId || null,
      date,
      created_by: userId,
    });

    setLoading(false);
    if (!error) onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-[20px] font-bold">Nova transação</h2>
          <button onClick={onClose} className="text-text-secondary text-[14px]">
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("entrada")}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                type === "entrada"
                  ? "bg-success text-white"
                  : "bg-surface text-text-secondary"
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType("saida")}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                type === "saida"
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary"
              }`}
            >
              Saída
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Conta de luz"
              required
              className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Responsible */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
              Responsável
            </label>
            <select
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event (optional) */}
          {eventos.length > 0 && (
            <div>
              <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
                Evento (opcional)
              </label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
              >
                <option value="">Nenhum</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
