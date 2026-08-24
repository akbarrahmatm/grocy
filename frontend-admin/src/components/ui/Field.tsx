interface FieldProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
  error?: string;
}

export default function Field({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
  error,
}: FieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--ad-fg)" }}>
          {label}
        </label>
      )}
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 [color:var(--ad-muted)]"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-9 pr-9 py-2.5 rounded-md border text-sm outline-none"
          style={{
            background: "var(--ad-bg)",
            borderColor: "var(--ad-border)",
            color: "var(--ad-fg)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ad-border)")}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{error}</p>}
    </div>
  );
}