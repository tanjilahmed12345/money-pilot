"use client";

import { cn } from "@/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  accent?: string;
}

export function Card({ children, className, id, onClick, accent }: CardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      style={accent ? {
        backgroundColor: `color-mix(in srgb, ${accent} 6%, var(--card))`,
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-medium text-[var(--muted-foreground)]", className)}>
      {children}
    </h3>
  );
}

export function CardValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-2 text-2xl font-bold text-[var(--card-foreground)]", className)}>
      {children}
    </p>
  );
}
