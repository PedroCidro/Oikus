"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HouseInfoCard } from "@/components/moradores/house-info-card";
import { MemberRow } from "@/components/moradores/member-row";
import { AddMarcaModal } from "@/components/moradores/add-marca-modal";
import type { Perfil, Casa } from "@/lib/supabase/types";

export function MoradoresClient({
  perfil,
  house,
  members,
  marcaCounts,
}: {
  perfil: Perfil;
  house: Casa;
  members: Perfil[];
  marcaCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [marcaTarget, setMarcaTarget] = useState<Perfil | null>(null);

  const isAdmin = perfil.role === "admin";

  async function handleToggleRole(member: Perfil) {
    const supabase = createClient();
    const newRole = member.role === "admin" ? "membro" : "admin";
    await supabase
      .from("perfis")
      .update({ role: newRole })
      .eq("id", member.id);
    router.refresh();
  }

  return (
    <main className="px-5 pt-14 pb-6">
      <h1 className="font-heading text-[28px] font-bold mb-6">Moradores</h1>

      <HouseInfoCard
        houseName={house.name}
        inviteCode={house.invite_code}
        memberCount={members.length}
      />

      <h2 className="font-heading text-[18px] font-semibold mb-3">Membros</h2>

      <div className="divide-y divide-surface-dim">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            perfil={m}
            marcaCount={marcaCounts[m.id] || 0}
            isAdmin={isAdmin}
            isSelf={m.id === perfil.id}
            onToggleRole={() => handleToggleRole(m)}
            onAddMarca={() => setMarcaTarget(m)}
          />
        ))}
      </div>

      {marcaTarget && (
        <AddMarcaModal
          houseId={house.id}
          target={marcaTarget}
          onClose={() => setMarcaTarget(null)}
          onCreated={() => {
            setMarcaTarget(null);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}
