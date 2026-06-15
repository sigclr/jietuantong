export type UserRole = 'owner' | 'member' | 'admin';
export type ProjectStatus = 'pending' | 'ongoing' | 'completed' | 'settling';
export type ScheduleDirection = 'receivable' | 'payable';
export type ScheduleStatus = 'pending' | 'paid' | 'done';
export type TransactionDirection = 'income' | 'expense';
export type SupplierCategory = 'hotel' | 'fleet' | 'guide' | 'ticket' | 'restaurant' | 'other';

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
  email: string;
  role: UserRole;
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
}

export interface Supplier {
  id: string;
  orgId: string;
  name: string;
  category: SupplierCategory;
  settlementNote: string;
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
  pax: number;
  leaderName?: string;
  leaderPhone?: string;
  remark?: string;
  grossProfitCents: number;
}

export interface PaymentSchedule {
  id: string;
  orgId: string;
  projectId: string;
  direction: ScheduleDirection;
  counterpartyName: string;
  phase: string;
  amountCents: number;
  dueDate: string;
  status: ScheduleStatus;
}

export interface Transaction {
  id: string;
  orgId: string;
  projectId: string;
  direction: TransactionDirection;
  category: string;
  itemName: string;
  supplierId?: string;
  unitPriceCents: number;
  quantity: number;
  date: string;
  note?: string;
}

export interface Invite {
  code: string;
  orgId: string;
  expiresAt: string;
}
