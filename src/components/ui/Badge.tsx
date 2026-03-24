"use client";

import { cn } from "@/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}20`, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}
