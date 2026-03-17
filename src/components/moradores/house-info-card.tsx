"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export function HouseInfoCard({
  houseName,
  inviteCode,
  memberCount,
}: {
  houseName: string;
  inviteCode: string;
  memberCount: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="mb-6">
      <h2 className="font-heading text-[18px] font-semibold">{houseName}</h2>
      <p className="text-text-secondary text-[13px] mt-1">
        {memberCount} {memberCount === 1 ? "morador" : "moradores"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 bg-background rounded-xl px-4 py-2.5">
          <p className="text-text-secondary text-[11px] uppercase tracking-wide font-medium">
            Código de convite
          </p>
          <p className="text-[18px] font-bold tracking-widest mt-0.5">
            {inviteCode}
          </p>
        </div>
        <button
          onClick={copyCode}
          className="shrink-0 bg-accent/10 text-accent rounded-xl px-4 py-3 text-[13px] font-semibold hover:bg-accent/20 transition-colors"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </Card>
  );
}
