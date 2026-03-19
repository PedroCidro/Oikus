"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilterChips } from "@/components/ui/filter-chips";
import { Button } from "@/components/ui/button";
import { CreateTransactionModal } from "@/components/financas/create-transaction-modal";
import { getMonthName } from "@/lib/utils";
import type { Transacao, EventoFinanceiro, Perfil } from "@/lib/supabase/types";

const TABS = ["Caixa", "Eventos"];
const CATEGORIES: Record<string, string> = {
  gastos: "Gastos",
  fornecedores: "Fornecedores",
  lucro: "Lucro",
  pessoas: "Pessoas",
};
const CATEGORY_COLORS: Record<string, string> = {
  gastos: "bg-accent",
  fornecedores: "bg-text-secondary",
  pessoas: "bg-[#D4A574]",
  lucro: "bg-success",
};

export function FinancasClient({
  transacoes,
  eventos,
  members,
  userId,
  houseId,
  isAdmin,
}: {
  transacoes: Transacao[];
  eventos: EventoFinanceiro[];
  members: Perfil[];
  userId: string;
  houseId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("Caixa");
  const [showBalance, setShowBalance] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const entradas = transacoes.filter((t) => t.type === "entrada");
  const saidas = transacoes.filter((t) => t.type === "saida");
  const totalEntradas = entradas.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = totalEntradas - totalSaidas;

  // Category breakdown for pie chart
  const categoryTotals: Record<string, number> = {};
  saidas.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });
  const totalCategorias = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Event summaries
  const eventSummaries = eventos.map((evento) => {
    const eventTransacoes = transacoes.filter((t) => t.evento_id === evento.id);
    const eventEntradas = eventTransacoes
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const eventSaidas = eventTransacoes
      .filter((t) => t.type === "saida")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { evento, entradas: eventEntradas, saidas: eventSaidas, saldo: eventEntradas - eventSaidas };
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[28px] font-bold">Finanças</h1>
        <Button onClick={() => setShowModal(true)}>+ Nova</Button>
      </div>

      {/* Balance */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="font-heading text-[36px] font-bold text-accent leading-tight tracking-tight">
            {showBalance ? `R$ ${formatCurrency(saldo)}` : "R$ •••••"}
          </span>
          <button onClick={() => setShowBalance(!showBalance)} className="text-text-secondary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {showBalance ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>
        <p className="text-text-secondary text-[13px]">Saldo atual</p>
      </div>

      {/* Tabs */}
      <FilterChips options={TABS} active={tab} onChange={setTab} />

      {tab === "Caixa" ? (
        <CaixaView
          entradas={entradas}
          saidas={saidas}
          totalEntradas={totalEntradas}
          totalSaidas={totalSaidas}
          categoryTotals={categoryTotals}
          totalCategorias={totalCategorias}
          memberMap={memberMap}
          month={month}
          year={year}
          formatCurrency={formatCurrency}
        />
      ) : (
        <EventosView
          eventSummaries={eventSummaries}
          formatCurrency={formatCurrency}
        />
      )}

      {showModal && (
        <CreateTransactionModal
          houseId={houseId}
          userId={userId}
          members={members}
          eventos={eventos}
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

function CaixaView({
  entradas,
  saidas,
  totalEntradas,
  totalSaidas,
  categoryTotals,
  totalCategorias,
  memberMap,
  month,
  year,
  formatCurrency,
}: {
  entradas: Transacao[];
  saidas: Transacao[];
  totalEntradas: number;
  totalSaidas: number;
  categoryTotals: Record<string, number>;
  totalCategorias: number;
  memberMap: Record<string, Perfil>;
  month: number;
  year: number;
  formatCurrency: (v: number) => string;
}) {
  return (
    <>
      {/* Period */}
      <div className="flex items-center justify-between mt-5 mb-4">
        <p className="text-[14px] font-semibold">
          {getMonthName(month)} {year}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-surface rounded-xl p-4">
          <p className="font-heading text-[24px] font-bold text-success leading-tight">
            +{formatCurrency(totalEntradas)}
          </p>
          <p className="text-text-secondary text-[13px]">Entradas</p>
        </div>
        <div className="flex-1 bg-surface rounded-xl p-4">
          <p className="font-heading text-[24px] font-bold text-accent leading-tight">
            -{formatCurrency(totalSaidas)}
          </p>
          <p className="text-text-secondary text-[13px]">Saídas</p>
        </div>
      </div>

      {/* Pie Chart */}
      {totalCategorias > 0 && (
        <div className="flex items-center gap-5 mb-6">
          <PieChart categoryTotals={categoryTotals} total={totalCategorias} />
          <div className="flex flex-col gap-2.5 flex-1">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat] || "bg-text-secondary"}`} />
                    <span className="text-[13px] font-medium">{CATEGORIES[cat]}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-text-secondary">
                    {Math.round((val / totalCategorias) * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Entradas List */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-[18px] font-semibold">Entradas</h2>
      </div>
      {entradas.length > 0 ? (
        <div className="divide-y divide-surface-dim mb-5">
          {entradas.slice(0, 3).map((t) => (
            <TransactionRow key={t.id} transaction={t} memberMap={memberMap} formatCurrency={formatCurrency} />
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-[13px] py-3 mb-5">Nenhuma entrada no período</p>
      )}

      {/* Saídas List */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-[18px] font-semibold">Saídas</h2>
      </div>
      {saidas.length > 0 ? (
        <div className="divide-y divide-surface-dim">
          {saidas.slice(0, 3).map((t) => (
            <TransactionRow key={t.id} transaction={t} memberMap={memberMap} formatCurrency={formatCurrency} />
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-[13px] py-3">Nenhuma saída no período</p>
      )}
    </>
  );
}

function EventosView({
  eventSummaries,
  formatCurrency,
}: {
  eventSummaries: {
    evento: EventoFinanceiro;
    entradas: number;
    saidas: number;
    saldo: number;
  }[];
  formatCurrency: (v: number) => string;
}) {
  if (eventSummaries.length === 0) {
    return (
      <p className="text-text-secondary text-[15px] py-8 text-center mt-4">
        Nenhum evento cadastrado
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-5">
      {eventSummaries.map(({ evento, entradas, saidas, saldo }) => (
        <div key={evento.id} className="bg-surface rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-heading text-[16px] font-semibold">{evento.name}</p>
              <p className="text-text-secondary text-[12px]">
                {new Date(evento.date + "T12:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B7D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-text-secondary text-[11px] font-medium uppercase tracking-wider">Entradas</p>
              <p className="font-heading text-[18px] font-bold text-success">+R$ {formatCurrency(entradas)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-[11px] font-medium uppercase tracking-wider">Saídas</p>
              <p className="font-heading text-[18px] font-bold text-accent">-R$ {formatCurrency(saidas)}</p>
            </div>
            <div className="ml-auto">
              <p className="text-text-secondary text-[11px] font-medium uppercase tracking-wider">Saldo</p>
              <p className="font-heading text-[18px] font-bold">R$ {formatCurrency(saldo)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionRow({
  transaction,
  memberMap,
  formatCurrency,
}: {
  transaction: Transacao;
  memberMap: Record<string, Perfil>;
  formatCurrency: (v: number) => string;
}) {
  const isEntrada = transaction.type === "entrada";
  const responsible = memberMap[transaction.responsible_id];

  return (
    <div className="flex items-center gap-3 py-3">
      <span className={`font-heading text-[15px] font-bold w-[90px] shrink-0 ${isEntrada ? "text-success" : "text-accent"}`}>
        {isEntrada ? "+" : "-"} R$ {formatCurrency(Number(transaction.amount))}
      </span>
      <span className="text-[13px] font-medium w-[65px] shrink-0 truncate">
        {responsible?.name?.split(" ")[0] ?? "—"}
      </span>
      <span className="text-text-secondary text-[13px] truncate">
        {transaction.description}
      </span>
    </div>
  );
}

function PieChart({
  categoryTotals,
  total,
}: {
  categoryTotals: Record<string, number>;
  total: number;
}) {
  const COLORS: Record<string, string> = {
    gastos: "#C4653A",
    fornecedores: "#8B7D6B",
    pessoas: "#D4A574",
    lucro: "#4A7C59",
  };

  const circumference = 2 * Math.PI * 45;
  let offset = 0;

  const segments = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => {
      const segment = {
        key: cat,
        color: COLORS[cat] || "#8B7D6B",
        dashArray: `${(val / total) * circumference} ${circumference}`,
        offset: -offset,
      };
      offset += (val / total) * circumference;
      return segment;
    });

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="shrink-0">
      <circle cx="55" cy="55" r="45" fill="none" stroke="#F2EDE6" strokeWidth="18" />
      {segments.map((seg) => (
        <circle
          key={seg.key}
          cx="55"
          cy="55"
          r="45"
          fill="none"
          stroke={seg.color}
          strokeWidth="18"
          strokeDasharray={seg.dashArray}
          strokeDashoffset={seg.offset}
          transform="rotate(-90 55 55)"
        />
      ))}
    </svg>
  );
}
