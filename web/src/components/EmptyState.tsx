interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-title">{title}</div>
      {description && <p className="text-muted">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
