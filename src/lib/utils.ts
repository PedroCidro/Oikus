const AVATAR_COLORS = ["#C4653A", "#8B7D6B", "#D4C8B8", "#B8C4D4"];

export function getAvatarColor(userId: string): string {
  return AVATAR_COLORS[userId.charCodeAt(0) % 4];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function getMonthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return "Atrasada";
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function getTaskBadgeVariant(
  status: string,
  dueDate: string | null
): "feita" | "perdida" | "urgente" | "pendente" | "aguardando aprovação" {
  if (status === "completed") return "feita";
  if (status === "missed") return "perdida";
  if (status === "pending_approval") return "aguardando aprovação";
  if (dueDate) {
    const date = new Date(dueDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 1) return "urgente";
  }
  return "pendente";
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
