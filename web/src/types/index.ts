export type Persona = 'boss' | 'op' | 'finance';
export type UserRole = 'owner' | 'member';
export type ProjectStatus = 'pending' | 'ongoing' | 'completed' | 'settled' | 'cancelled';
export type BizType = 'self_operated' | 'outsourced_out';
export type PartnerKind = 'group_agent' | 'peer' | 'both';
export type PricingUnit = 'per_person' | 'per_group';
export type ScheduleDirection = 'receivable' | 'payable';
export type ScheduleStatus = 'pending' | 'done';
export type TransactionDirection = 'income' | 'expense';
export type SupplierCategory = 'hotel' | 'transport' | 'restaurant' | 'ticket' | 'guide' | 'other';
export type ProjectDetailTab = 'basic' | 'quote' | 'transactions' | 'schedules';

export interface Organization {
  id: string;
  name: string;
  licenseNo?: string;
  city?: string;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  role: UserRole;
  persona: Persona;
}

export interface Partner {
  id: string;
  orgId: string;
  name: string;
  contact: string;
  phone: string;
  partnerKind: PartnerKind;
  settlementDays: number;
  activeProjects: number;
  unpaidReceivableCents: number;
  note?: string;
}

export interface Supplier {
  id: string;
  orgId: string;
  name: string;
  category: SupplierCategory;
  settlementNote: string;
  contactName?: string;
  contactPhone?: string;
}

export interface Project {
  id: string;
  orgId: string;
  groupNo: string;
  title: string;
  partnerId: string;
  bizType: BizType;
  outsourcedToPartnerId?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  paxAdult: number;
  paxChild: number;
  ownerUserId: string;
  leaderName?: string;
  leaderPhone?: string;
  remark?: string;
  cancelReason?: string;
}

export interface ProjectQuoteItem {
  id: string;
  orgId: string;
  projectId: string;
  itemLabel: string;
  unitPriceCents: number;
  pricingUnit: PricingUnit;
  quantity: number;
  remark?: string;
  sortOrder: number;
}

export interface PaymentSchedule {
  id: string;
  orgId: string;
  projectId: string;
  direction: ScheduleDirection;
  counterpartyName: string;
  title: string;
  amountCents: number;
  dueDate: string;
  status: ScheduleStatus;
  doneTxnId?: string;
}

export interface Transaction {
  id: string;
  orgId: string;
  projectId: string;
  direction: TransactionDirection;
  category: string;
  amountCents: number;
  supplierId?: string;
  date: string;
  note?: string;
  createdBy: string;
}

export interface Invite {
  code: string;
  orgId: string;
  expiresAt: string;
  maxUses?: number;
  usedCount?: number;
}

export type QuoteItemDraft = Omit<ProjectQuoteItem, 'id' | 'orgId' | 'projectId' | 'sortOrder'> & {
  sortOrder?: number;
};
