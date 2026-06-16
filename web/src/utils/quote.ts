import type {
  OutsourcePaymentMethod,
  OutsourceSettlement,
  OutsourceSettlementStatus,
  PricingUnit,
  Project,
  ProjectOutsourceItem,
  ProjectQuoteItem,
  OutsourceItemDraft,
  QuoteItemDraft,
  QuoteDirection,
} from '../types';

export function quoteItemAmountCents(
  item: Pick<ProjectQuoteItem, 'unitPriceCents' | 'pricingUnit' | 'quantity' | 'direction'>,
  paxAdult: number,
  paxChild: number,
): number {
  let base: number;
  if (item.pricingUnit === 'per_person') {
    base = item.unitPriceCents * (paxAdult + paxChild);
  } else {
    base = item.unitPriceCents * (item.quantity || 1);
  }
  return item.direction === 'subtract' ? -base : base;
}

export function plannedIncomeCents(
  items: ProjectQuoteItem[],
  project: Pick<Project, 'paxAdult' | 'paxChild'>,
): number {
  return items.reduce(
    (sum, item) => sum + quoteItemAmountCents(item, project.paxAdult, project.paxChild),
    0,
  );
}

export function outsourceItemAmountCents(
  item: Pick<ProjectOutsourceItem, 'unitPriceCents' | 'pricingUnit' | 'quantity'>,
  paxAdult: number,
  paxChild: number,
): number {
  if (item.pricingUnit === 'per_person') {
    return item.unitPriceCents * (paxAdult + paxChild);
  }
  return item.unitPriceCents * (item.quantity || 1);
}

export function outsourceTotalCents(
  items: ProjectOutsourceItem[],
  project: Pick<Project, 'paxAdult' | 'paxChild'>,
): number {
  return items.reduce(
    (sum, item) => sum + outsourceItemAmountCents(item, project.paxAdult, project.paxChild),
    0,
  );
}

export function outsourcePaidCents(settlements: Pick<OutsourceSettlement, 'amountCents'>[]): number {
  return settlements.reduce((sum, s) => sum + s.amountCents, 0);
}

export function outsourcePendingCents(estimatedCents: number, paidCents: number): number {
  return Math.max(0, estimatedCents - paidCents);
}

export function outsourceSettlementStatus(
  estimatedCents: number,
  paidCents: number,
): OutsourceSettlementStatus {
  if (estimatedCents <= 0) return 'empty';
  if (paidCents <= 0) return 'unsettled';
  if (paidCents < estimatedCents) return 'partial';
  if (paidCents > estimatedCents) return 'overpaid';
  return 'settled';
}

export function outsourceSettlementStatusLabel(status: OutsourceSettlementStatus): string {
  const map: Record<OutsourceSettlementStatus, string> = {
    empty: '—',
    unsettled: '未结清',
    partial: '部分结清',
    settled: '已结清',
    overpaid: '已付超出',
  };
  return map[status];
}

export function outsourcePaymentMethodLabel(method: OutsourcePaymentMethod): string {
  const map: Record<OutsourcePaymentMethod, string> = {
    bank_transfer: '银行转账',
    cash: '现金',
    alipay: '支付宝',
    other: '其他',
  };
  return map[method];
}

export function outsourceSpreadCents(
  quoteItems: ProjectQuoteItem[],
  outsourceItems: ProjectOutsourceItem[],
  project: Pick<Project, 'paxAdult' | 'paxChild'>,
): number {
  return plannedIncomeCents(quoteItems, project) - outsourceTotalCents(outsourceItems, project);
}

export function pricingUnitLabel(unit: PricingUnit): string {
  return unit === 'per_person' ? '/人' : '/组';
}

export function quoteDirectionLabel(dir: QuoteDirection): string {
  return dir === 'add' ? '+' : '−';
}

export function bizTypeLabel(biz: string): string {
  return biz === 'outsourced_out' ? '拼出' : '自营';
}

export function partnerKindLabel(kind: string): string {
  const map: Record<string, string> = {
    group_agent: '组团社',
    peer: '同行',
    both: '兼有',
  };
  return map[kind] ?? kind;
}

export function isGroupAgentPartner(kind: string): boolean {
  return kind === 'group_agent' || kind === 'both';
}

export function isPeerPartner(kind: string): boolean {
  return kind === 'peer' || kind === 'both';
}

export function emptyQuoteDraft(): QuoteItemDraft {
  return {
    itemLabel: '',
    direction: 'add',
    unitPriceCents: 0,
    pricingUnit: 'per_person',
    quantity: 1,
    remark: '',
  };
}

export function emptyOutsourceDraft(peerPartnerId = ''): OutsourceItemDraft {
  return {
    peerPartnerId,
    itemLabel: '',
    unitPriceCents: 0,
    pricingUnit: 'per_person',
    quantity: 1,
    standard: '',
    remark: '',
  };
}
