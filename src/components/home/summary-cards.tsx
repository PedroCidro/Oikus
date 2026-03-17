import { Card } from "@/components/ui/card";

export function SummaryCards({
  pendingCount,
  marcaCount,
}: {
  pendingCount: number;
  marcaCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <p className="text-text-secondary text-[13px] font-medium">Pendentes</p>
        <p className="font-heading text-[28px] font-bold mt-1">{pendingCount}</p>
        <p className="text-text-secondary text-[11px]">tarefas</p>
      </Card>
      <Card>
        <p className="text-text-secondary text-[13px] font-medium">Marcas</p>
        <p className="font-heading text-[28px] font-bold mt-1">{marcaCount}</p>
        <p className="text-text-secondary text-[11px]">este mês</p>
      </Card>
    </div>
  );
}
