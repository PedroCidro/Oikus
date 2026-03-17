const BADGE_STYLES: Record<string, string> = {
  urgente: "bg-accent-light text-accent",
  pendente: "bg-surface text-text-secondary",
  "aguardando aprovação": "bg-warning-light text-warning",
  feita: "bg-success-light text-success",
  perdida: "bg-danger-light text-danger",
  punido: "bg-danger-light text-danger",
  safe: "bg-success-light text-success",
  admin: "bg-accent-light text-accent",
  membro: "bg-surface text-text-secondary",
};

export function Badge({ variant }: { variant: string }) {
  const style = BADGE_STYLES[variant] ?? BADGE_STYLES.pendente;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style}`}
    >
      {variant}
    </span>
  );
}
