import type { PricingUnit, Project, ProjectQuoteItem, QuoteItemDraft } from '../types';

export function quoteItemAmountCents(
  item: Pick<ProjectQuoteItem, 'unitPriceCents' | 'pricingUnit' | 'quantity'>,
  paxAdult: number,
  paxChild: number,
): number {
  if (item.pricingUnit === 'per_person') {
    return item.unitPriceCents * (paxAdult + paxChild);
  }
  return item.unitPriceCents * (item.quantity || 1);
}

export function plannedIncomeCents(
  items: ProjectQuoteItem[],
  project: Pick<Project, 'paxAdult' | 'paxChild'>,
): number {
  return items.reduce((sum, item) => sum + quoteItemAmountCents(item, project.paxAdult, project.paxChild), 0);
}

export function pricingUnitLabel(unit: PricingUnit): string {
  return unit === 'per_person' ? '/人' : '/组';
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
    unitPriceCents: 0,
    pricingUnit: 'per_person',
    quantity: 1,
    remark: '',
  };
}
