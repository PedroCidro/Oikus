"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { HouseInfoCard } from "@/components/moradores/house-info-card";
import { MemberRow } from "@/components/moradores/member-row";
import { AddMarcaModal } from "@/components/moradores/add-marca-modal";
import type { Perfil, Casa, Marca } from "@/lib/supabase/types";

export default function MoradoresPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [house, setHouse] = useState<Casa | null>(null);
  const [members, setMembers] = useState<Perfil[]>([]);
  const [marcaCounts, setMarcaCounts] = useState<Record<string, number>>({});
  const [marcaTarget, setMarcaTarget] = useState<Perfil | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: p } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", user.id)
      .single<Perfil>();
    setPerfil(p);

    if (!p?.house_id) return;

    const { data: h } = await supabase
      .from("casas")
      .select("*")
      .eq("id", p.house_id)
      .single<Casa>();
    setHouse(h);

    const { data: m } = await supabase
      .from("perfis")
      .select("*")
      .eq("house_id", p.house_id)
      .order("created_at", { ascending: true })
      .returns<Perfil[]>();
    setMembers(m ?? []);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data: marcas } = await supabase
      .from("marcas")
      .select("user_id")
      .eq("house_id", p.house_id)
      .eq("month", month)
      .eq("year", year)
      .returns<Pick<Marca, "user_id">[]>();

    const counts: Record<string, number> = {};
    marcas?.forEach((mk) => {
      counts[mk.user_id] = (counts[mk.user_id] || 0) + 1;
    });
    setMarcaCounts(counts);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleRole(member: Perfil) {
    const supabase = createClient();
    const newRole = member.role === "admin" ? "membro" : "admin";
    await supabase
      .from("perfis")
      .update({ role: newRole })
      .eq("id", member.id);
    load();
  }

  if (!perfil || !house) {
    return (
      <main className="px-5 pt-14">
        <p className="text-text-secondary">Carregando...</p>
      </main>
    );
  }

  const isAdmin = perfil.role === "admin";

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
            load();
          }}
        />
      )}
    </main>
  );
}
