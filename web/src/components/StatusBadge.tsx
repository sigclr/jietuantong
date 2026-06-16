import type { ProjectStatus } from '../types';
import { projectStatusLabel } from '../utils/format';

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  ongoing: 'badge-ongoing',
  completed: 'badge-completed',
  settled: 'badge-settled',
  cancelled: 'badge-cancelled',
};

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  return <span className={`badge ${STATUS_CLASS[status] ?? 'badge-pending'}`}>{projectStatusLabel(status)}</span>;
}

export function ScheduleBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  if (status === 'done') return <span className="badge badge-paid">已收/已付</span>;
  if (overdue) return <span className="badge badge-overdue">逾期</span>;
  return <span className="badge badge-pending">待收/待付</span>;
}

export function BizTypeBadge({ bizType }: { bizType: string }) {
  if (bizType === 'outsourced_out') {
    return <span className="badge badge-outsourced">拼出</span>;
  }
  return <span className="badge badge-self">自营</span>;
}

export function OutsourceSourceBadge() {
  return <span className="badge badge-outsource-payable">拼出</span>;
}

const OUTSOURCE_SETTLE_CLASS: Record<string, string> = {
  unsettled: 'badge-outsource-unsettled',
  partial: 'badge-outsource-partial',
  settled: 'badge-outsource-settled',
  overpaid: 'badge-outsource-overpaid',
};

export function OutsourceSettlementBadge({ status }: { status: string }) {
  if (status === 'empty') return <span className="text-muted">—</span>;
  const labels: Record<string, string> = {
    unsettled: '未结清',
    partial: '部分结清',
    settled: '已结清',
    overpaid: '已付超出',
  };
  return (
    <span className={`badge ${OUTSOURCE_SETTLE_CLASS[status] ?? 'badge-outsource-unsettled'}`}>
      {labels[status] ?? status}
    </span>
  );
}
