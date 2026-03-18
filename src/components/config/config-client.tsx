"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileSection } from "@/components/config/profile-section";
import { SettingsRow } from "@/components/config/settings-row";
import { ToggleRow } from "@/components/config/toggle-row";
import type { Perfil, Casa } from "@/lib/supabase/types";

export function ConfigClient({
  perfil,
  initialHouse,
  initialThreshold,
}: {
  perfil: Perfil;
  initialHouse: Casa | null;
  initialThreshold: number;
}) {
  const router = useRouter();
  const [house, setHouse] = useState(initialHouse);
  const [threshold, setThreshold] = useState(initialThreshold);
  const [notifications, setNotifications] = useState({
    tarefas: true,
    tribunal: true,
    marcas: true,
  });

  async function handleLeaveHouse() {
    const supabase = createClient();
    await supabase
      .from("perfis")
      .update({ house_id: null, role: "membro" })
      .eq("id", perfil.id);
    router.push("/onboarding");
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="px-5 pt-14 pb-6">
      <h1 className="font-heading text-[28px] font-bold mb-6">
        Configurações
      </h1>

      <ProfileSection perfil={perfil} />

      {house && (
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
            República
          </h2>
          <div className="divide-y divide-surface-dim">
            <SettingsRow label="Nome" value={house.name} />
            <SettingsRow label="Código de convite" value={house.invite_code} />
            {perfil.role === "admin" && (
              <>
                <ToggleRow
                  label="Aprovar tarefas concluídas"
                  checked={house.require_approval}
                  onChange={async (v) => {
                    const supabase = createClient();
                    await supabase
                      .from("casas")
                      .update({ require_approval: v })
                      .eq("id", house.id);
                    setHouse({ ...house, require_approval: v });
                  }}
                />
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-[15px] font-medium">Limite de marcas</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        if (threshold <= 1) return;
                        const newVal = threshold - 1;
                        setThreshold(newVal);
                        const supabase = createClient();
                        const now = new Date();
                        await supabase.from("periodos").upsert(
                          {
                            house_id: house.id,
                            month: now.getMonth() + 1,
                            year: now.getFullYear(),
                            threshold: newVal,
                          },
                          { onConflict: "house_id,month,year" }
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-[16px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                    >
                      −
                    </button>
                    <span className="text-[18px] font-bold w-6 text-center">
                      {threshold}
                    </span>
                    <button
                      onClick={async () => {
                        const newVal = threshold + 1;
                        setThreshold(newVal);
                        const supabase = createClient();
                        const now = new Date();
                        await supabase.from("periodos").upsert(
                          {
                            house_id: house.id,
                            month: now.getMonth() + 1,
                            year: now.getFullYear(),
                            threshold: newVal,
                          },
                          { onConflict: "house_id,month,year" }
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-[16px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
          Notificações
        </h2>
        <div className="divide-y divide-surface-dim">
          <ToggleRow
            label="Tarefas"
            checked={notifications.tarefas}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, tarefas: v }))
            }
          />
          <ToggleRow
            label="Tribunal"
            checked={notifications.tribunal}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, tribunal: v }))
            }
          />
          <ToggleRow
            label="Marcas"
            checked={notifications.marcas}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, marcas: v }))
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
          Conta
        </h2>
        <div className="divide-y divide-surface-dim">
          <SettingsRow label="Sair da república" onClick={handleLeaveHouse} danger />
          <SettingsRow
            label="Sair da conta"
            onClick={handleLogout}
            danger
          />
        </div>
      </section>
    </main>
  );
}
