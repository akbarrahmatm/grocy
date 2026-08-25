import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-[var(--ink)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-[var(--paper)]",
          error ? "border-red-400" : "border-[var(--line)] focus:border-[var(--moss)]"
        )}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}