import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import dayjs from 'dayjs';
import { cloneInitialData } from './data';
import type { Partner, PaymentSchedule, Project, Transaction } from '../types';

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
  suppliers: ReturnType<typeof cloneInitialData>['suppliers'];
  projects: Project[];
  paymentSchedules: PaymentSchedule[];
  transactions: Transaction[];
  invites: ReturnType<typeof cloneInitialData>['invites'];
  isLoggedIn: boolean;
  highlightScheduleId: string | null;
  projectDetailTab: 'basic' | 'transactions' | 'schedules';
}

interface AppContextValue extends AppState {
  login: () => void;
  logout: () => void;
  getPartner: (id: string) => Partner | undefined;
  getProject: (id: string) => Project | undefined;
  getProjectByGroupNo: (groupNo: string) => Project | undefined;
  getPartnerName: (id: string) => string;
  getSupplierName: (id: string) => string;
  markScheduleDone: (id: string) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  addPartner: (p: Omit<Partner, 'id' | 'orgId' | 'activeProjects' | 'unpaidReceivableCents'>) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'orgId'>) => void;
  search: (q: string) => SearchResult[];
  setHighlightSchedule: (id: string | null) => void;
  setProjectDetailTab: (tab: 'basic' | 'transactions' | 'schedules') => void;
  projectFinance: (projectId: string) => {
    incomeCents: number;
    expenseCents: number;
    profitCents: number;
  };
  overdueSchedules: () => (PaymentSchedule & { project?: Project; overdueDays: number })[];
  dashboardStats: () => {
    monthProjects: number;
    ongoing: number;
    monthProfitCents: number;
    overdueReceivableCents: number;
    overdueReceivableCount: number;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

function txTotal(t: { unitPriceCents: number; quantity: number }) {
  return t.unitPriceCents * t.quantity;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    ...cloneInitialData(),
    isLoggedIn: false,
    highlightScheduleId: null,
    projectDetailTab: 'basic',
  }));

  const login = useCallback(() => setState((s) => ({ ...s, isLoggedIn: true })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, isLoggedIn: false })), []);

  const getPartner = useCallback((id: string) => state.partners.find((p) => p.id === id), [state.partners]);
  const getProject = useCallback((id: string) => state.projects.find((p) => p.id === id || p.groupNo === id), [state.projects]);
  const getProjectByGroupNo = useCallback((groupNo: string) => state.projects.find((p) => p.groupNo === groupNo), [state.projects]);
  const getPartnerName = useCallback((id: string) => state.partners.find((p) => p.id === id)?.name ?? '—', [state.partners]);
  const getSupplierName = useCallback((id: string) => state.suppliers.find((s) => s.id === id)?.name ?? '—', [state.suppliers]);

  const markScheduleDone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      paymentSchedules: s.paymentSchedules.map((sch) =>
        sch.id === id ? { ...sch, status: 'paid' as const } : sch,
      ),
    }));
  }, []);

  const updateProjectStatus = useCallback((id: string, status: Project['status']) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id || p.groupNo === id ? { ...p, status } : p)),
    }));
  }, []);

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

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'orgId'>) => {
    setState((s) => {
      const newTx: Transaction = { ...t, id: `tx${Date.now()}`, orgId: s.organization.id };
      const expense = t.direction === 'expense' ? txTotal(t) : 0;
      const income = t.direction === 'income' ? txTotal(t) : 0;
      return {
        ...s,
        transactions: [newTx, ...s.transactions],
        projects: s.projects.map((p) =>
          p.id === t.projectId
            ? { ...p, grossProfitCents: p.grossProfitCents + income - expense }
            : p,
        ),
      };
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

  const setProjectDetailTab = useCallback((tab: 'basic' | 'transactions' | 'schedules') => {
    setState((s) => ({ ...s, projectDetailTab: tab }));
  }, []);

  const projectFinance = useCallback(
    (projectId: string) => {
      const txs = state.transactions.filter((t) => t.projectId === projectId);
      const incomeCents = txs.filter((t) => t.direction === 'income').reduce((s, t) => s + txTotal(t), 0);
      const expenseCents = txs.filter((t) => t.direction === 'expense').reduce((s, t) => s + txTotal(t), 0);
      return { incomeCents, expenseCents, profitCents: incomeCents - expenseCents };
    },
    [state.transactions],
  );

  const overdueSchedules = useCallback(() => {
    const today = dayjs();
    return state.paymentSchedules
      .filter((s) => s.status === 'pending' && dayjs(s.dueDate).isBefore(today, 'day'))
      .map((s) => ({
        ...s,
        project: state.projects.find((p) => p.id === s.projectId),
        overdueDays: today.diff(dayjs(s.dueDate), 'day'),
      }))
      .sort((a, b) => b.overdueDays - a.overdueDays);
  }, [state.paymentSchedules, state.projects]);

  const dashboardStats = useCallback(() => {
    const monthStart = dayjs().startOf('month');
    const monthProjects = state.projects.filter((p) => dayjs(p.startDate).isAfter(monthStart.subtract(1, 'day'))).length;
    const ongoing = state.projects.filter((p) => p.status === 'ongoing').length;
    const monthProfitCents = state.projects.reduce((s, p) => s + p.grossProfitCents, 0);
    const overdue = state.paymentSchedules.filter(
      (s) => s.direction === 'receivable' && s.status === 'pending' && dayjs(s.dueDate).isBefore(dayjs(), 'day'),
    );
    return {
      monthProjects,
      ongoing,
      monthProfitCents,
      overdueReceivableCents: overdue.reduce((s, x) => s + x.amountCents, 0),
      overdueReceivableCount: overdue.length,
    };
  }, [state.projects, state.paymentSchedules]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      login,
      logout,
      getPartner,
      getProject,
      getProjectByGroupNo,
      getPartnerName,
      getSupplierName,
      markScheduleDone,
      updateProjectStatus,
      addPartner,
      addTransaction,
      search,
      setHighlightSchedule,
      setProjectDetailTab,
      projectFinance,
      overdueSchedules,
      dashboardStats,
    }),
    [
      state,
      login,
      logout,
      getPartner,
      getProject,
      getProjectByGroupNo,
      getPartnerName,
      getSupplierName,
      markScheduleDone,
      updateProjectStatus,
      addPartner,
      addTransaction,
      search,
      setHighlightSchedule,
      setProjectDetailTab,
      projectFinance,
      overdueSchedules,
      dashboardStats,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
