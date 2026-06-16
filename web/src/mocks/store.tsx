import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import dayjs from 'dayjs';
import { cloneInitialData } from './data';
import { plannedIncomeCents, outsourceTotalCents, outsourcePaidCents, outsourcePendingCents, outsourceSettlementStatus, outsourcePaymentMethodLabel } from '../utils/quote';
import type {
  OutsourceItemDraft,
  OutsourceSettlement,
  OutsourceSettlementDraft,
  Partner,
  PaymentSchedule,
  Persona,
  Project,
  ProjectDetailTab,
  ProjectOutsourceItem,
  ProjectQuoteItem,
  QuoteItemDraft,
  Supplier,
  Transaction,
} from '../types';

export interface SearchResult {
  type: 'project' | 'partner';
  id: string;
  label: string;
  sublabel?: string;
}

interface AppState {
  organization: ReturnType<typeof cloneInitialData>['organization'];
  users: ReturnType<typeof cloneInitialData>['users'];
  partners: Partner[];
  suppliers: Supplier[];
  projects: Project[];
  projectQuoteItems: ProjectQuoteItem[];
  projectOutsourceItems: ProjectOutsourceItem[];
  outsourceSettlements: OutsourceSettlement[];
  paymentSchedules: PaymentSchedule[];
  transactions: Transaction[];
  invites: ReturnType<typeof cloneInitialData>['invites'];
  isLoggedIn: boolean;
  currentPersona: Persona;
  highlightScheduleId: string | null;
  projectDetailTab: ProjectDetailTab;
  toastMessage: string | null;
}

interface AppContextValue extends AppState {
  login: () => void;
  logout: () => void;
  setPersona: (p: Persona) => void;
  toast: (msg: string) => void;
  clearToast: () => void;
  getPartner: (id: string) => Partner | undefined;
  getProject: (id: string) => Project | undefined;
  getProjectByGroupNo: (groupNo: string) => Project | undefined;
  getSupplier: (id: string) => Supplier | undefined;
  getPartnerName: (id: string) => string;
  getSupplierName: (id: string) => string;
  getUserName: (id: string) => string;
  markScheduleDone: (id: string) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  cancelProject: (id: string, reason: string) => void;
  addProject: (p: Omit<Project, 'id' | 'orgId' | 'groupNo'>) => { id: string; groupNo: string };
  addQuoteItems: (projectId: string, items: QuoteItemDraft[]) => void;
  setQuoteItems: (projectId: string, items: QuoteItemDraft[]) => void;
  getQuoteItems: (projectId: string) => ProjectQuoteItem[];
  addOutsourceItems: (projectId: string, items: OutsourceItemDraft[]) => void;
  setOutsourceItems: (projectId: string, items: OutsourceItemDraft[]) => void;
  getOutsourceItems: (projectId: string) => ProjectOutsourceItem[];
  getOutsourceSettlements: (projectId: string) => OutsourceSettlement[];
  projectOutsourceFinance: (projectId: string) => {
    estimatedCents: number;
    paidCents: number;
    pendingCents: number;
    status: ReturnType<typeof outsourceSettlementStatus>;
  };
  addOutsourceSettlement: (
    projectId: string,
    draft: OutsourceSettlementDraft,
  ) => { ok: true } | { ok: false; reason: string };
  addOutsourcePayableSchedule: (projectId: string) => boolean;
  syncOutsourcePayableSchedule: (projectId: string) => boolean;
  projectPlannedIncome: (projectId: string) => number;
  addSchedule: (s: Omit<PaymentSchedule, 'id' | 'orgId' | 'status'>) => void;
  addScheduleTemplate: (projectId: string, template: 'deposit_tail') => void;
  addPartner: (p: Omit<Partner, 'id' | 'orgId' | 'activeProjects' | 'unpaidReceivableCents'>) => void;
  addSupplier: (s: Omit<Supplier, 'id' | 'orgId'>) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'orgId' | 'createdBy'>) => void;
  search: (q: string) => SearchResult[];
  setHighlightSchedule: (id: string | null) => void;
  setProjectDetailTab: (tab: ProjectDetailTab) => void;
  projectFinance: (projectId: string) => {
    incomeCents: number;
    expenseCents: number;
    profitCents: number;
  };
  overdueSchedules: () => (PaymentSchedule & { project?: Project; overdueDays: number })[];
  agingByPartner: () => {
    partnerId: string;
    partnerName: string;
    pendingCents: number;
    overdueCents: number;
    maxOverdueDays: number;
  }[];
  dashboardStats: () => {
    monthProjects: number;
    ongoing: number;
    monthProfitCents: number;
    overdueReceivableCents: number;
    overdueReceivableCount: number;
    pendingScheduleCount: number;
  };
  opStats: () => { ongoing: number; pendingSchedules: number };
}

const AppContext = createContext<AppContextValue | null>(null);

function genGroupNo(): string {
  const d = dayjs().format('YYYYMMDD');
  const seq = String(Math.floor(Math.random() * 90) + 10);
  return `JTT-${d}-${seq}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    ...cloneInitialData(),
    isLoggedIn: false,
    currentPersona: 'op',
    highlightScheduleId: null,
    projectDetailTab: 'basic',
    toastMessage: null,
  }));

  const toast = useCallback((msg: string) => {
    setState((s) => ({ ...s, toastMessage: msg }));
    setTimeout(() => setState((s) => (s.toastMessage === msg ? { ...s, toastMessage: null } : s)), 2800);
  }, []);

  const clearToast = useCallback(() => setState((s) => ({ ...s, toastMessage: null })), []);

  const login = useCallback(() => setState((s) => ({ ...s, isLoggedIn: true, currentPersona: 'op' })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, isLoggedIn: false })), []);
  const setPersona = useCallback((p: Persona) => setState((s) => ({ ...s, currentPersona: p })), []);

  const getPartner = useCallback((id: string) => state.partners.find((p) => p.id === id), [state.partners]);
  const getProject = useCallback(
    (id: string) => state.projects.find((p) => p.id === id || p.groupNo === id),
    [state.projects],
  );
  const getProjectByGroupNo = useCallback(
    (groupNo: string) => state.projects.find((p) => p.groupNo === groupNo),
    [state.projects],
  );
  const getSupplier = useCallback((id: string) => state.suppliers.find((s) => s.id === id), [state.suppliers]);
  const getPartnerName = useCallback((id: string) => state.partners.find((p) => p.id === id)?.name ?? '—', [state.partners]);
  const getSupplierName = useCallback((id: string) => state.suppliers.find((s) => s.id === id)?.name ?? '—', [state.suppliers]);
  const getUserName = useCallback((id: string) => state.users.find((u) => u.id === id)?.name ?? '—', [state.users]);

  const markScheduleDone = useCallback((id: string) => {
    setState((s) => {
      const sch = s.paymentSchedules.find((x) => x.id === id);
      if (!sch || sch.status === 'done') return s;
      if (sch.sourceKind === 'outsource') return s;

      const txId = `tx${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        orgId: s.organization.id,
        projectId: sch.projectId,
        direction: sch.direction === 'receivable' ? 'income' : 'expense',
        category: sch.direction === 'receivable' ? 'group_fee' : 'other',
        amountCents: sch.amountCents,
        date: dayjs().format('YYYY-MM-DD'),
        note: `${sch.title} · ${sch.counterpartyName}`,
        createdBy: 'u2',
      };

      return {
        ...s,
        paymentSchedules: s.paymentSchedules.map((x) =>
          x.id === id ? { ...x, status: 'done' as const, doneTxnId: txId } : x,
        ),
        transactions: [newTx, ...s.transactions],
      };
    });
  }, []);

  const updateProjectStatus = useCallback((id: string, status: Project['status']) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id || p.groupNo === id ? { ...p, status } : p)),
    }));
  }, []);

  const cancelProject = useCallback((id: string, reason: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id || p.groupNo === id ? { ...p, status: 'cancelled' as const, cancelReason: reason } : p,
      ),
    }));
  }, []);

  const addProject = useCallback((p: Omit<Project, 'id' | 'orgId' | 'groupNo'>): { id: string; groupNo: string } => {
    const id = `proj${Date.now()}`;
    const groupNo = genGroupNo();
    setState((s) => ({
      ...s,
      projects: [
        {
          ...p,
          id,
          orgId: s.organization.id,
          groupNo,
        },
        ...s.projects,
      ],
      partners: s.partners.map((pt) =>
        pt.id === p.partnerId ? { ...pt, activeProjects: pt.activeProjects + 1 } : pt,
      ),
    }));
    return { id, groupNo };
  }, []);

  const addSchedule = useCallback((sch: Omit<PaymentSchedule, 'id' | 'orgId' | 'status'>) => {
    setState((s) => ({
      ...s,
      paymentSchedules: [
        ...s.paymentSchedules,
        { ...sch, id: `sch${Date.now()}`, orgId: s.organization.id, status: 'pending' as const },
      ],
    }));
  }, []);

  const addScheduleTemplate = useCallback((projectId: string, template: 'deposit_tail') => {
    if (template !== 'deposit_tail') return;
    setState((s) => {
      const project = s.projects.find((p) => p.id === projectId);
      if (!project) return s;
      const partner = s.partners.find((p) => p.id === project.partnerId);
      const quoteItems = s.projectQuoteItems.filter((q) => q.projectId === projectId);
      const fromQuote = quoteItems.length > 0 ? plannedIncomeCents(quoteItems, project) : 0;
      const total =
        fromQuote ||
        s.paymentSchedules
          .filter((x) => x.projectId === projectId && x.direction === 'receivable')
          .reduce((sum, x) => sum + x.amountCents, 0) ||
        10000000;
      const deposit = Math.round(total * 0.3);
      const tail = total - deposit;
      const base = Date.now();
      const newSchedules: PaymentSchedule[] = [
        {
          id: `sch${base}`,
          orgId: s.organization.id,
          projectId,
          direction: 'receivable',
          counterpartyName: partner?.name ?? '合作方',
          title: '定金',
          amountCents: deposit,
          dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
          status: 'pending',
        },
        {
          id: `sch${base + 1}`,
          orgId: s.organization.id,
          projectId,
          direction: 'receivable',
          counterpartyName: partner?.name ?? '合作方',
          title: '尾款',
          amountCents: tail,
          dueDate: dayjs(project.endDate).add(3, 'day').format('YYYY-MM-DD'),
          status: 'pending',
        },
      ];
      return { ...s, paymentSchedules: [...s.paymentSchedules, ...newSchedules] };
    });
  }, []);

  const addQuoteItems = useCallback((projectId: string, items: QuoteItemDraft[]) => {
    if (items.length === 0) return;
    const base = Date.now();
    setState((s) => ({
      ...s,
      projectQuoteItems: [
        ...s.projectQuoteItems,
        ...items.map((d, i) => ({
          id: `pqi${base}${i}`,
          orgId: s.organization.id,
          projectId,
          itemLabel: d.itemLabel,
          direction: d.direction ?? 'add',
          unitPriceCents: d.unitPriceCents,
          pricingUnit: d.pricingUnit,
          quantity: d.quantity,
          remark: d.remark,
          sortOrder: i,
        })),
      ],
    }));
  }, []);

  const setQuoteItems = useCallback((projectId: string, items: QuoteItemDraft[]) => {
    const base = Date.now();
    setState((s) => ({
      ...s,
      projectQuoteItems: [
        ...s.projectQuoteItems.filter((q) => q.projectId !== projectId),
        ...items.map((d, i) => ({
          id: `pqi${base}${i}`,
          orgId: s.organization.id,
          projectId,
          itemLabel: d.itemLabel,
          direction: d.direction ?? 'add',
          unitPriceCents: d.unitPriceCents,
          pricingUnit: d.pricingUnit,
          quantity: d.quantity,
          remark: d.remark,
          sortOrder: i,
        })),
      ],
    }));
  }, []);

  const getQuoteItems = useCallback(
    (projectId: string) =>
      state.projectQuoteItems
        .filter((q) => q.projectId === projectId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [state.projectQuoteItems],
  );

  const addOutsourceItems = useCallback((projectId: string, items: OutsourceItemDraft[]) => {
    if (items.length === 0) return;
    const base = Date.now();
    setState((s) => ({
      ...s,
      projectOutsourceItems: [
        ...s.projectOutsourceItems,
        ...items.map((d, i) => ({
          id: `poi${base}${i}`,
          orgId: s.organization.id,
          projectId,
          peerPartnerId: d.peerPartnerId,
          itemLabel: d.itemLabel,
          unitPriceCents: d.unitPriceCents,
          pricingUnit: d.pricingUnit,
          quantity: d.quantity,
          standard: d.standard,
          remark: d.remark,
          sortOrder: i,
        })),
      ],
    }));
  }, []);

  const setOutsourceItems = useCallback((projectId: string, items: OutsourceItemDraft[]) => {
    const base = Date.now();
    setState((s) => ({
      ...s,
      projectOutsourceItems: [
        ...s.projectOutsourceItems.filter((o) => o.projectId !== projectId),
        ...items.map((d, i) => ({
          id: `poi${base}${i}`,
          orgId: s.organization.id,
          projectId,
          peerPartnerId: d.peerPartnerId,
          itemLabel: d.itemLabel,
          unitPriceCents: d.unitPriceCents,
          pricingUnit: d.pricingUnit,
          quantity: d.quantity,
          standard: d.standard,
          remark: d.remark,
          sortOrder: i,
        })),
      ],
    }));
  }, []);

  const getOutsourceItems = useCallback(
    (projectId: string) =>
      state.projectOutsourceItems
        .filter((o) => o.projectId === projectId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [state.projectOutsourceItems],
  );

  const getOutsourceSettlements = useCallback(
    (projectId: string) =>
      state.outsourceSettlements
        .filter((o) => o.projectId === projectId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.outsourceSettlements],
  );

  const projectOutsourceFinance = useCallback(
    (projectId: string) => {
      const project = state.projects.find((p) => p.id === projectId);
      const items = state.projectOutsourceItems.filter((o) => o.projectId === projectId);
      const settlements = state.outsourceSettlements.filter((o) => o.projectId === projectId);
      const estimatedCents = project && items.length > 0 ? outsourceTotalCents(items, project) : 0;
      const paidCents = outsourcePaidCents(settlements);
      const pendingCents = outsourcePendingCents(estimatedCents, paidCents);
      const status = outsourceSettlementStatus(estimatedCents, paidCents);
      return { estimatedCents, paidCents, pendingCents, status };
    },
    [state.projects, state.projectOutsourceItems, state.outsourceSettlements],
  );

  const addOutsourceSettlement = useCallback(
    (projectId: string, draft: OutsourceSettlementDraft): { ok: true } | { ok: false; reason: string } => {
      let result: { ok: true } | { ok: false; reason: string } = { ok: false, reason: '未知错误' };

      setState((s) => {
        const project = s.projects.find((p) => p.id === projectId);
        if (!project || project.bizType !== 'outsourced_out') {
          result = { ok: false, reason: '仅拼出团可结账' };
          return s;
        }

        const items = s.projectOutsourceItems.filter((o) => o.projectId === projectId);
        const estimatedCents = outsourceTotalCents(items, project);
        if (estimatedCents <= 0) {
          result = { ok: false, reason: '请先填写拼出价格' };
          return s;
        }

        const settlements = s.outsourceSettlements.filter((o) => o.projectId === projectId);
        const paidCents = outsourcePaidCents(settlements);
        const pendingCents = outsourcePendingCents(estimatedCents, paidCents);

        if (pendingCents <= 0) {
          result = { ok: false, reason: '该拼出已全部结清' };
          return s;
        }
        if (draft.amountCents <= 0 || draft.amountCents > pendingCents) {
          result = { ok: false, reason: '本次结算不可超过待付金额' };
          return s;
        }

        const peerId = project.outsourcedToPartnerId ?? items[0]?.peerPartnerId;
        const peer = s.partners.find((p) => p.id === peerId);
        if (!peer) {
          result = { ok: false, reason: '未找到承接同行' };
          return s;
        }

        const txId = `tx${Date.now()}`;
        const settlementId = `osl${Date.now()}`;
        const methodLabel = outsourcePaymentMethodLabel(draft.paymentMethod);

        const newTx: Transaction = {
          id: txId,
          orgId: s.organization.id,
          projectId,
          direction: 'expense',
          category: 'other',
          amountCents: draft.amountCents,
          date: draft.settledDate,
          note: `拼出结账 · ${peer.name} · ${methodLabel}${draft.remark ? ` · ${draft.remark}` : ''}`,
          createdBy: 'u2',
        };

        const newSettlement: OutsourceSettlement = {
          id: settlementId,
          orgId: s.organization.id,
          projectId,
          peerPartnerId: peer.id,
          amountCents: draft.amountCents,
          paymentMethod: draft.paymentMethod,
          settledDate: draft.settledDate,
          remark: draft.remark,
          txnId: txId,
          createdBy: 'u2',
          createdAt: Math.floor(Date.now() / 1000),
        };

        const newPaid = paidCents + draft.amountCents;
        const markSchedulesDone = newPaid >= estimatedCents;

        result = { ok: true };
        return {
          ...s,
          transactions: [newTx, ...s.transactions],
          outsourceSettlements: [...s.outsourceSettlements, newSettlement],
          paymentSchedules: markSchedulesDone
            ? s.paymentSchedules.map((sch) =>
                sch.projectId === projectId &&
                sch.sourceKind === 'outsource' &&
                sch.direction === 'payable' &&
                sch.status === 'pending'
                  ? { ...sch, status: 'done' as const, doneTxnId: txId }
                  : sch,
              )
            : s.paymentSchedules,
        };
      });

      return result;
    },
    [],
  );

  const addOutsourcePayableSchedule = useCallback((projectId: string): boolean => {
    let added = false;
    setState((s) => {
      const project = s.projects.find((p) => p.id === projectId);
      if (!project || project.bizType !== 'outsourced_out') return s;

      const items = s.projectOutsourceItems.filter((o) => o.projectId === projectId);
      const total = outsourceTotalCents(items, project);
      if (total <= 0) return s;

      const peerId = project.outsourcedToPartnerId ?? items[0]?.peerPartnerId;
      const peer = s.partners.find((p) => p.id === peerId);
      if (!peer) return s;

      const existing = s.paymentSchedules.find(
        (sch) =>
          sch.projectId === projectId &&
          sch.sourceKind === 'outsource' &&
          sch.direction === 'payable' &&
          sch.status === 'pending',
      );

      if (existing) {
        added = true;
        return {
          ...s,
          paymentSchedules: s.paymentSchedules.map((sch) =>
            sch.id === existing.id
              ? { ...sch, amountCents: total, counterpartyName: peer.name, peerPartnerId: peer.id }
              : sch,
          ),
        };
      }

      added = true;
      return {
        ...s,
        paymentSchedules: [
          ...s.paymentSchedules,
          {
            id: `sch${Date.now()}`,
            orgId: s.organization.id,
            projectId,
            direction: 'payable' as const,
            counterpartyName: peer.name,
            title: '拼出团款',
            amountCents: total,
            dueDate: project.startDate,
            status: 'pending' as const,
            sourceKind: 'outsource' as const,
            peerPartnerId: peer.id,
          },
        ],
      };
    });
    return added;
  }, []);

  const syncOutsourcePayableSchedule = useCallback((projectId: string): boolean => {
    return addOutsourcePayableSchedule(projectId);
  }, [addOutsourcePayableSchedule]);

  const projectPlannedIncome = useCallback(
    (projectId: string) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return 0;
      const items = state.projectQuoteItems.filter((q) => q.projectId === projectId);
      return plannedIncomeCents(items, project);
    },
    [state.projects, state.projectQuoteItems],
  );

  const addPartner = useCallback(
    (p: Omit<Partner, 'id' | 'orgId' | 'activeProjects' | 'unpaidReceivableCents'>) => {
      setState((s) => ({
        ...s,
        partners: [
          ...s.partners,
          {
            ...p,
            id: `p${Date.now()}`,
            orgId: s.organization.id,
            activeProjects: 0,
            unpaidReceivableCents: 0,
          },
        ],
      }));
    },
    [],
  );

  const addSupplier = useCallback((sup: Omit<Supplier, 'id' | 'orgId'>) => {
    setState((s) => ({
      ...s,
      suppliers: [...s.suppliers, { ...sup, id: `s${Date.now()}`, orgId: s.organization.id }],
    }));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'orgId' | 'createdBy'>) => {
    setState((s) => {
      const newTx: Transaction = { ...t, id: `tx${Date.now()}`, orgId: s.organization.id, createdBy: 'u2' };
      return { ...s, transactions: [newTx, ...s.transactions] };
    });
  }, []);

  const search = useCallback(
    (q: string): SearchResult[] => {
      const query = q.trim().toLowerCase();
      if (!query) return [];
      const projectResults = state.projects
        .filter(
          (p) =>
            p.groupNo.toLowerCase().includes(query) ||
            p.title.toLowerCase().includes(query) ||
            getPartnerName(p.partnerId).toLowerCase().includes(query),
        )
        .slice(0, 5)
        .map((p) => ({
          type: 'project' as const,
          id: p.groupNo,
          label: p.groupNo,
          sublabel: `${p.title} · ${getPartnerName(p.partnerId)}`,
        }));
      const partnerResults = state.partners
        .filter((p) => p.name.toLowerCase().includes(query) || p.contact.toLowerCase().includes(query))
        .slice(0, 3)
        .map((p) => ({
          type: 'partner' as const,
          id: p.id,
          label: p.name,
          sublabel: p.contact,
        }));
      return [...projectResults, ...partnerResults];
    },
    [state.projects, state.partners, getPartnerName],
  );

  const setHighlightSchedule = useCallback((id: string | null) => {
    setState((s) => ({ ...s, highlightScheduleId: id }));
  }, []);

  const setProjectDetailTab = useCallback((tab: ProjectDetailTab) => {
    setState((s) => ({ ...s, projectDetailTab: tab }));
  }, []);

  const projectFinance = useCallback(
    (projectId: string) => {
      const txs = state.transactions.filter((t) => t.projectId === projectId);
      const incomeCents = txs.filter((t) => t.direction === 'income').reduce((sum, t) => sum + t.amountCents, 0);
      const expenseCents = txs.filter((t) => t.direction === 'expense').reduce((sum, t) => sum + t.amountCents, 0);
      return { incomeCents, expenseCents, profitCents: incomeCents - expenseCents };
    },
    [state.transactions],
  );

  const overdueSchedules = useCallback(() => {
    const today = dayjs();
    return state.paymentSchedules
      .filter((sch) => sch.status === 'pending' && dayjs(sch.dueDate).isBefore(today, 'day'))
      .map((sch) => ({
        ...sch,
        project: state.projects.find((p) => p.id === sch.projectId),
        overdueDays: today.diff(dayjs(sch.dueDate), 'day'),
      }))
      .sort((a, b) => b.overdueDays - a.overdueDays);
  }, [state.paymentSchedules, state.projects]);

  const agingByPartner = useCallback(() => {
    const today = dayjs();
    const map = new Map<string, { pendingCents: number; overdueCents: number; maxOverdueDays: number }>();

    state.paymentSchedules
      .filter((s) => s.direction === 'receivable' && s.status === 'pending')
      .forEach((s) => {
        const project = state.projects.find((p) => p.id === s.projectId);
        const partnerId = project?.partnerId ?? 'unknown';
        const cur = map.get(partnerId) ?? { pendingCents: 0, overdueCents: 0, maxOverdueDays: 0 };
        cur.pendingCents += s.amountCents;
        if (dayjs(s.dueDate).isBefore(today, 'day')) {
          const days = today.diff(dayjs(s.dueDate), 'day');
          cur.overdueCents += s.amountCents;
          cur.maxOverdueDays = Math.max(cur.maxOverdueDays, days);
        }
        map.set(partnerId, cur);
      });

    return Array.from(map.entries()).map(([partnerId, v]) => ({
      partnerId,
      partnerName: getPartnerName(partnerId),
      ...v,
    }));
  }, [state.paymentSchedules, state.projects, getPartnerName]);

  const dashboardStats = useCallback(() => {
    const monthStart = dayjs().startOf('month');
    const monthProjects = state.projects.filter((p) => dayjs(p.startDate).isAfter(monthStart.subtract(1, 'day'))).length;
    const ongoing = state.projects.filter((p) => p.status === 'ongoing').length;
    const monthTxs = state.transactions.filter((t) => dayjs(t.date).isAfter(monthStart.subtract(1, 'day')));
    const monthProfitCents =
      monthTxs.filter((t) => t.direction === 'income').reduce((s, t) => s + t.amountCents, 0) -
      monthTxs.filter((t) => t.direction === 'expense').reduce((s, t) => s + t.amountCents, 0);
    const overdue = state.paymentSchedules.filter(
      (s) => s.direction === 'receivable' && s.status === 'pending' && dayjs(s.dueDate).isBefore(dayjs(), 'day'),
    );
    const pendingScheduleCount = state.paymentSchedules.filter((s) => s.status === 'pending').length;
    return {
      monthProjects,
      ongoing,
      monthProfitCents,
      overdueReceivableCents: overdue.reduce((s, x) => s + x.amountCents, 0),
      overdueReceivableCount: overdue.length,
      pendingScheduleCount,
    };
  }, [state.projects, state.paymentSchedules, state.transactions]);

  const opStats = useCallback(() => {
    const ongoing = state.projects.filter((p) => p.status === 'ongoing' || p.status === 'pending').length;
    const pendingSchedules = state.paymentSchedules.filter((s) => s.status === 'pending').length;
    return { ongoing, pendingSchedules };
  }, [state.projects, state.paymentSchedules]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      login,
      logout,
      setPersona,
      toast,
      clearToast,
      getPartner,
      getProject,
      getProjectByGroupNo,
      getSupplier,
      getPartnerName,
      getSupplierName,
      getUserName,
      markScheduleDone,
      updateProjectStatus,
      cancelProject,
      addProject,
      addQuoteItems,
      setQuoteItems,
      getQuoteItems,
      addOutsourceItems,
      setOutsourceItems,
      getOutsourceItems,
      getOutsourceSettlements,
      projectOutsourceFinance,
      addOutsourceSettlement,
      addOutsourcePayableSchedule,
      syncOutsourcePayableSchedule,
      projectPlannedIncome,
      addSchedule,
      addScheduleTemplate,
      addPartner,
      addSupplier,
      addTransaction,
      search,
      setHighlightSchedule,
      setProjectDetailTab,
      projectFinance,
      overdueSchedules,
      agingByPartner,
      dashboardStats,
      opStats,
    }),
    [
      state,
      login,
      logout,
      setPersona,
      toast,
      clearToast,
      getPartner,
      getProject,
      getProjectByGroupNo,
      getSupplier,
      getPartnerName,
      getSupplierName,
      getUserName,
      markScheduleDone,
      updateProjectStatus,
      cancelProject,
      addProject,
      addQuoteItems,
      setQuoteItems,
      getQuoteItems,
      addOutsourceItems,
      setOutsourceItems,
      getOutsourceItems,
      getOutsourceSettlements,
      projectOutsourceFinance,
      addOutsourceSettlement,
      addOutsourcePayableSchedule,
      syncOutsourcePayableSchedule,
      projectPlannedIncome,
      addSchedule,
      addScheduleTemplate,
      addPartner,
      addSupplier,
      addTransaction,
      search,
      setHighlightSchedule,
      setProjectDetailTab,
      projectFinance,
      overdueSchedules,
      agingByPartner,
      dashboardStats,
      opStats,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function canEdit(persona: Persona): boolean {
  return persona === 'op';
}
