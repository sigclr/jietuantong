import dayjs from 'dayjs';

export function formatMoney(cents: number): string {
  const yuan = cents / 100;
  return '¥' + yuan.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatDate(d: string): string {
  return dayjs(d).format('YYYY-MM-DD');
}

export function formatDateShort(d: string): string {
  return dayjs(d).format('MM-DD');
}

export function isOverdue(dueDate: string, status: string): boolean {
  return status === 'pending' && dayjs(dueDate).isBefore(dayjs(), 'day');
}

export function projectStatusLabel(s: string): string {
  const map: Record<string, string> = {
    pending: '待确认',
    ongoing: '执行中',
    completed: '已结团',
    settling: '结算中',
  };
  return map[s] ?? s;
}
