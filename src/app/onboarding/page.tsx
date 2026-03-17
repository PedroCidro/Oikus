"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { generateInviteCode } from "@/lib/utils";
import type { Casa } from "@/lib/supabase/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [houseName, setHouseName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const code = generateInviteCode();
    const casaId = crypto.randomUUID();
    const { error: casaError } = await supabase
      .from("casas")
      .insert({ id: casaId, name: houseName, invite_code: code });

    if (casaError) {
      setError(casaError.message);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("perfis")
      .update({ house_id: casaId, role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: casa } = await supabase
      .from("casas")
      .select("id")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .single<Pick<Casa, "id">>();

    if (!casa) {
      setError("Código inválido. Verifique com seus moradores.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("perfis")
      .update({ house_id: casa.id })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (mode === "choose") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-[28px] font-bold mb-1">
            Sua república
          </h1>
          <p className="text-text-secondary text-[15px] mb-8">
            Crie uma nova república ou entre em uma existente
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full rounded-2xl bg-surface p-5 text-left hover:bg-surface-dim transition-colors"
            >
              <p className="font-semibold text-[15px]">Criar república</p>
              <p className="text-text-secondary text-[13px] mt-0.5">
                Monte sua república e convide moradores
              </p>
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full rounded-2xl bg-surface p-5 text-left hover:bg-surface-dim transition-colors"
            >
              <p className="font-semibold text-[15px]">Entrar com código</p>
              <p className="text-text-secondary text-[13px] mt-0.5">
                Use o código de convite da sua república
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setMode("choose")}
            className="text-text-secondary text-[13px] mb-6 hover:text-accent"
          >
            ← Voltar
          </button>
          <h1 className="font-heading text-[28px] font-bold mb-1">
            Criar república
          </h1>
          <p className="text-text-secondary text-[15px] mb-8">
            Dê um nome para sua república
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Nome da república
              </label>
              <input
                type="text"
                required
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
                placeholder="Ex: República do Limoeiro"
              />
            </div>

            {error && <p className="text-danger text-[13px]">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setMode("choose")}
          className="text-text-secondary text-[13px] mb-6 hover:text-accent"
        >
          ← Voltar
        </button>
        <h1 className="font-heading text-[28px] font-bold mb-1">
          Entrar na república
        </h1>
        <p className="text-text-secondary text-[15px] mb-8">
          Peça o código de convite para um morador
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Código de convite
            </label>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] uppercase tracking-widest text-center outline-none focus:border-accent transition-colors"
              placeholder="ABC123"
              maxLength={6}
            />
          </div>

          {error && <p className="text-danger text-[13px]">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
