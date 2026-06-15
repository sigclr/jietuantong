import dayjs from 'dayjs';
import type { Persona } from '../types';

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
    ongoing: '进行中',
    completed: '已完成',
    settled: '已结清',
    cancelled: '已取消',
  };
  return map[s] ?? s;
}

export function personaLabel(p: Persona): string {
  const map: Record<Persona, string> = {
    boss: '马总',
    op: '阿财',
    finance: '王姐',
  };
  return map[p];
}

export function personaHome(p: Persona): string {
  const map: Record<Persona, string> = {
    boss: '/dashboard',
    op: '/projects',
    finance: '/finance',
  };
  return map[p];
}

export const SUPPLIER_CATEGORY_LABELS: Record<string, string> = {
  hotel: '酒店',
  transport: '用车',
  guide: '导服',
  ticket: '门票',
  restaurant: '餐饮',
  other: '其他',
};

export const INCOME_CATEGORIES: Record<string, string> = {
  group_fee: '团款',
  other_income: '其他收入',
};
