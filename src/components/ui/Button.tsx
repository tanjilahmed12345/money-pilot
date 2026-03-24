"use client";

import { cn } from "@/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80",
  danger: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
