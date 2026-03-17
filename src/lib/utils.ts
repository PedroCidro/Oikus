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

const MEMBER_COLORS = [
  "#C4653A", "#5B8A72", "#7B6BA8", "#2D8C9E",
  "#B8860B", "#D4453A", "#5B6ABF", "#8B5E3C",
  "#3A8F7C", "#C44A8B",
];

export function getMemberColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

export function getWeekBounds(referenceDate: Date): { monday: Date; sunday: Date } {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
