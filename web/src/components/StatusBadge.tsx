import type { ProjectStatus } from '../types';
import { projectStatusLabel } from '../utils/format';

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  ongoing: 'badge-ongoing',
  completed: 'badge-completed',
  settling: 'badge-settling',
};

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  return <span className={`badge ${STATUS_CLASS[status] ?? 'badge-pending'}`}>{projectStatusLabel(status)}</span>;
}

export function ScheduleBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  if (status === 'paid') return <span className="badge badge-paid">已收/已付</span>;
  if (overdue) return <span className="badge badge-overdue">逾期</span>;
  return <span className="badge badge-pending">待收/待付</span>;
}
