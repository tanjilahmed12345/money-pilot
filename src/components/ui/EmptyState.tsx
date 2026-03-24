"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-lg font-medium text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
    </div>
  );
}
