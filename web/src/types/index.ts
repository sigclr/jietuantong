export type Persona = 'boss' | 'op' | 'finance';
export type UserRole = 'owner' | 'member';
export type ProjectStatus = 'pending' | 'ongoing' | 'completed' | 'settled' | 'cancelled';
export type ScheduleDirection = 'receivable' | 'payable';
export type ScheduleStatus = 'pending' | 'done';
export type TransactionDirection = 'income' | 'expense';
export type SupplierCategory = 'hotel' | 'transport' | 'restaurant' | 'ticket' | 'guide' | 'other';

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
  budgetIncomeCents?: number;
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
