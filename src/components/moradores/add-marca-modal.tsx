"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Perfil } from "@/lib/supabase/types";

export function AddMarcaModal({
  houseId,
  target,
  onClose,
  onCreated,
}: {
  houseId: string;
  target: Perfil;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();

    await supabase.from("marcas").insert({
      house_id: houseId,
      user_id: target.id,
      reason,
      given_by: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-[18px] font-semibold">
            Marca para {target.name}
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
              Motivo
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors resize-none"
              rows={3}
              placeholder="Por que esta marca está sendo dada?"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adicionando..." : "Adicionar marca"}
          </Button>
        </form>
      </div>
    </div>
  );
}
