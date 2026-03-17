"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Perfil, Marca, Periodo } from "@/lib/supabase/types";

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
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    await supabase.from("marcas").insert({
      house_id: houseId,
      user_id: target.id,
      reason,
      given_by: user.id,
      month,
      year,
    });

    // Check if user hit the mark limit
    const { data: marcas } = await supabase
      .from("marcas")
      .select("id")
      .eq("house_id", houseId)
      .eq("user_id", target.id)
      .eq("month", month)
      .eq("year", year);

    const { data: periodo } = await supabase
      .from("periodos")
      .select("threshold")
      .eq("house_id", houseId)
      .eq("month", month)
      .eq("year", year)
      .single<Pick<Periodo, "threshold">>();

    const threshold = periodo?.threshold ?? 3;
    const count = marcas?.length ?? 0;

    if (count >= threshold) {
      // Check if there's already an open tribunal for this user this month
      const { data: existing } = await supabase
        .from("tribunais")
        .select("id")
        .eq("house_id", houseId)
        .eq("accused_id", target.id)
        .eq("status", "open")
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("tribunais").insert({
          house_id: houseId,
          accused_id: target.id,
          accuser_id: user.id,
          reason: `Atingiu o limite de ${threshold} marcas em ${month}/${year}`,
        });
      }
    }

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
