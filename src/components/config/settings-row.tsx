export function SettingsRow({
  label,
  value,
  onClick,
  danger,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3.5 text-left"
    >
      <span
        className={`text-[15px] font-medium ${
          danger ? "text-danger" : ""
        }`}
      >
        {label}
      </span>
      {value && (
        <span className="text-text-secondary text-[13px]">{value}</span>
      )}
    </button>
  );
}
