import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-[var(--moss)] text-white hover:bg-[var(--moss-dark)]",
        variant === "ghost" &&
          "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--lavender)]",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}