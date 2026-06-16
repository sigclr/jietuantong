import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { formatMoney, formatDateShort, isOverdue, SUPPLIER_CATEGORY_LABELS, INCOME_CATEGORIES } from '../../utils/format';
import { bizTypeLabel, emptyQuoteDraft, emptyOutsourceDraft, isPeerPartner, outsourceSpreadCents } from '../../utils/quote';
import { StatusBadge, ScheduleBadge, BizTypeBadge, OutsourceSourceBadge, OutsourceSettlementBadge } from '../../components/StatusBadge';
import { OutsourceSettlementDialog } from '../../components/OutsourceSettlementDialog';
import { Drawer } from '../../components/Drawer';
import { EmptyState } from '../../components/EmptyState';
import { RowActions } from '../../components/RowActions';
import { QuoteItemsEditor, quoteLinesFromItems, type QuoteLineDraft } from '../../components/QuoteItemsEditor';
import {
  OutsourceItemsEditor,
  outsourceLinesFromItems,
  type OutsourceLineDraft,
} from '../../components/OutsourceItemsEditor';
import type { ProjectDetailTab } from '../../types';

export function ProjectDetailPage() {
  const { id } = useParams();
  const {
    getProject,
    getPartnerName,
    getSupplierName,
    getUserName,
    paymentSchedules,
    transactions,
    suppliers,
    partners,
    markScheduleDone,
    updateProjectStatus,
    cancelProject,
    addTransaction,
    addSchedule,
    addScheduleTemplate,
    highlightScheduleId,
    setHighlightSchedule,
    projectDetailTab,
    setProjectDetailTab,
    projectFinance,
    projectPlannedIncome,
    getQuoteItems,
    setQuoteItems,
    getOutsourceItems,
    setOutsourceItems,
    projectOutsourceFinance,
    addOutsourceSettlement,
    addOutsourcePayableSchedule,
    syncOutsourcePayableSchedule,
    toast,
  } = useApp();
  const { canEditFinance, guardWrite } = useRole();

  const project = getProject(id ?? '');
  const [tab, setTab] = useState(projectDetailTab);
  const [txDrawer, setTxDrawer] = useState(false);
  const [txDirection, setTxDirection] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [showBigWarn, setShowBigWarn] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [settleConfirm, setSettleConfirm] = useState(false);
  const [quoteEdit, setQuoteEdit] = useState(false);
  const [quoteDraft, setQuoteDraft] = useState<QuoteLineDraft[]>([]);
  const [outsourceEdit, setOutsourceEdit] = useState(false);
  const [outsourceDraft, setOutsourceDraft] = useState<OutsourceLineDraft[]>([]);
  const [scheduleDrawer, setScheduleDrawer] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);

  useEffect(() => {
    setTab(projectDetailTab);
  }, [projectDetailTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTxDrawer(false);
        setScheduleDrawer(false);
        setCancelOpen(false);
        setSettleConfirm(false);
        setSettleDialogOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (highlightScheduleId) {
      const t = setTimeout(() => setHighlightSchedule(null), 2000);
      return () => clearTimeout(t);
    }
  }, [highlightScheduleId, setHighlightSchedule]);

  if (!project) {
    return <p>接团单不存在</p>;
  }

  const schedules = paymentSchedules.filter((s) => s.projectId === project.id);
  const txs = transactions.filter((t) => t.projectId === project.id);
  const finance = projectFinance(project.id);
  const pendingSchedules = schedules.filter((s) => s.status === 'pending');
  const plannedIncome = projectPlannedIncome(project.id);
  const quoteItems = getQuoteItems(project.id);
  const outsourceItems = getOutsourceItems(project.id);
  const peerPartners = partners.filter((p) => isPeerPartner(p.partnerKind));
  const outsourceFin = projectOutsourceFinance(project.id);
  const spreadPreview = outsourceSpreadCents(quoteItems, outsourceItems, project);
  const hasOutsourcePayable = schedules.some((s) => s.sourceKind === 'outsource');
  const peerName = project.outsourcedToPartnerId ? getPartnerName(project.outsourcedToPartnerId) : '—';
  const partner = partners.find((p) => p.id === project.partnerId);

  const switchTab = (t: ProjectDetailTab) => {
    setTab(t);
    setProjectDetailTab(t);
    if (t === 'quote' && canEditFinance) {
      setQuoteDraft(quoteLinesFromItems(quoteItems));
      setQuoteEdit(false);
    }
    if (t === 'outsource' && canEditFinance) {
      setOutsourceDraft(outsourceLinesFromItems(outsourceItems));
      setOutsourceEdit(false);
    }
  };

  const onStatusChange = (status: typeof project.status) => {
    if (!guardWrite('修改团状态')) return;
    if (status === 'settled' && pendingSchedules.length > 0) {
      setSettleConfirm(true);
      return;
    }
    if (status === 'cancelled') {
      setCancelOpen(true);
      return;
    }
    updateProjectStatus(project.id, status);
  };

  const confirmSettle = () => {
    updateProjectStatus(project.id, 'settled');
    setSettleConfirm(false);
    toast('团已标记为已结清');
  };

  const confirmCancel = () => {
    if (!cancelReason.trim()) return;
    cancelProject(project.id, cancelReason);
    setCancelOpen(false);
    toast('团已取消');
  };

  const saveTx = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guardWrite('记一笔')) return;
    const fd = new FormData(e.currentTarget);
    const yuan = parseFloat(amount);
    if (!yuan || yuan <= 0) return;
    addTransaction({
      projectId: project.id,
      direction: txDirection,
      category: fd.get('category') as string,
      amountCents: Math.round(yuan * 100),
      supplierId: txDirection === 'expense' ? (fd.get('supplierId') as string) || undefined : undefined,
      date: dayjs().format('YYYY-MM-DD'),
      note: (fd.get('note') as string) || undefined,
    });
    setAmount('');
    setTxDrawer(false);
    setShowBigWarn(false);
    toast('已记账');
  };

  const onAmountChange = (v: string) => {
    setAmount(v);
    const yuan = parseFloat(v);
    setShowBigWarn(!isNaN(yuan) && yuan > 100000);
  };

  const addCustomSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guardWrite('添加节点')) return;
    const fd = new FormData(e.currentTarget);
    const yuan = parseFloat(fd.get('amount') as string);
    addSchedule({
      projectId: project.id,
      direction: fd.get('direction') as 'receivable' | 'payable',
      counterpartyName: fd.get('counterparty') as string,
      title: fd.get('title') as string,
      amountCents: Math.round(yuan * 100),
      dueDate: fd.get('dueDate') as string,
    });
    setScheduleDrawer(false);
    toast('节点已添加');
  };

  const openSettleDialog = () => {
    if (outsourceItems.length === 0) {
      toast('请先填写拼出价格');
      switchTab('outsource');
      return;
    }
    if (outsourceFin.pendingCents <= 0) {
      toast('该拼出已全部结清');
      return;
    }
    setSettleDialogOpen(true);
  };

  const confirmOutsourceSettle = (draft: Parameters<typeof addOutsourceSettlement>[1]) => {
    if (!guardWrite('拼出结账')) return;
    const res = addOutsourceSettlement(project.id, draft);
    if (!res.ok) {
      toast(res.reason);
      return;
    }
    setSettleDialogOpen(false);
    toast('拼出结账成功，已联动记支出');
  };

  return (
    <>
      <div className="page-header">
        <h1>
          <Link to="/projects" className="text-muted">
            ← 接团单
          </Link>{' '}
          / {project.groupNo}
        </h1>
        {canEditFinance ? (
          <select
            value={project.status}
            onChange={(e) => onStatusChange(e.target.value as typeof project.status)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border)' }}
          >
            <option value="pending">待确认</option>
            <option value="ongoing">进行中</option>
            <option value="completed">已完成</option>
            <option value="settled">已结清</option>
            <option value="cancelled">取消团</option>
          </select>
        ) : (
          <StatusBadge status={project.status} />
        )}
      </div>

      <p style={{ marginBottom: 12 }}>
        <strong>{project.title}</strong> · {getPartnerName(project.partnerId)} ·{' '}
        <BizTypeBadge bizType={project.bizType} />
        {project.bizType === 'outsourced_out' && project.outsourcedToPartnerId && (
          <span className="outsource-header-summary">
            {' '}
            {peerName}
            {outsourceItems.length > 0 ? (
              <>
                {' · 预估 '}
                {formatMoney(outsourceFin.estimatedCents)}
                {' · 已付 '}
                {formatMoney(outsourceFin.paidCents)}
                {' · 待付 '}
                {formatMoney(outsourceFin.pendingCents)}
                {' · '}
                <OutsourceSettlementBadge status={outsourceFin.status} />
                {outsourceFin.status === 'overpaid' && (
                  <span className="text-warning"> · 已付超出预估，请核对</span>
                )}
              </>
            ) : (
              <span className="text-warning"> · 待填拼出价</span>
            )}
          </span>
        )}
        {project.bizType === 'outsourced_out' && outsourceFin.pendingCents > 0 && canEditFinance && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginLeft: 8 }}
            onClick={openSettleDialog}
          >
            应付结账
          </button>
        )}
        {' · '}
        成人{project.paxAdult}+儿童
        {project.paxChild} · {formatDateShort(project.startDate)}-{formatDateShort(project.endDate)} ·{' '}
        <StatusBadge status={project.status} />
        {project.cancelReason && <span className="text-muted"> · 取消原因：{project.cancelReason}</span>}
      </p>

      <p className="text-muted" style={{ marginBottom: 12, fontSize: 12 }}>
        计划收入 {plannedIncome ? formatMoney(plannedIncome) : '未录入'}
        {quoteItems.length > 0 && `（团款组成 ${quoteItems.length} 项）`}
        {project.bizType === 'outsourced_out' && outsourceItems.length > 0 && (
          <>
            {' · '}
            拼出差价（预览） {formatMoney(spreadPreview)}
          </>
        )}
        {project.bizType === 'outsourced_out' && !hasOutsourcePayable && outsourceItems.length > 0 && (
          <span className="text-warning"> · 建议生成拼出应付节点以便到期提醒</span>
        )}
        {' · '}
        实际毛利 {formatMoney(finance.profitCents)}
        {plannedIncome > 0 && (
          <span>
            {' '}
            · 偏差{' '}
            {Math.round(((finance.profitCents - (plannedIncome - finance.expenseCents)) / plannedIncome) * 100)}%（P2
            预览）
          </span>
        )}
      </p>

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'basic' ? 'active' : ''}`} onClick={() => switchTab('basic')}>
          基本信息
        </button>
        <button type="button" className={`tab ${tab === 'quote' ? 'active' : ''}`} onClick={() => switchTab('quote')}>
          团款组成
        </button>
        {project.bizType === 'outsourced_out' && (
          <button
            type="button"
            className={`tab ${tab === 'outsource' ? 'active' : ''}`}
            onClick={() => switchTab('outsource')}
          >
            拼出分项
          </button>
        )}
        <button
          type="button"
          className={`tab ${tab === 'transactions' ? 'active' : ''}`}
          onClick={() => switchTab('transactions')}
        >
          收支明细
        </button>
        <button
          type="button"
          className={`tab ${tab === 'schedules' ? 'active' : ''}`}
          onClick={() => switchTab('schedules')}
        >
          收付款节点
        </button>
      </div>

      {tab === 'basic' && (
        <div className="card">
          <div className="card-b grid2">
            <div>
              <span className="text-muted">团号</span>
              <div>{project.groupNo}</div>
            </div>
            <div>
              <span className="text-muted">组团社</span>
              <div>{getPartnerName(project.partnerId)}</div>
            </div>
            <div>
              <span className="text-muted">业务类型</span>
              <div>
                {bizTypeLabel(project.bizType)}
                {project.bizType === 'outsourced_out' && project.outsourcedToPartnerId && (
                  <span className="text-muted"> → {getPartnerName(project.outsourcedToPartnerId)}</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted">负责人</span>
              <div>{getUserName(project.ownerUserId)}</div>
            </div>
            <div>
              <span className="text-muted">领队</span>
              <div>
                {project.leaderName ?? '—'} {project.leaderPhone ?? ''}
              </div>
            </div>
            <div>
              <span className="text-muted">备注</span>
              <div>{project.remark || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'quote' && (
        <div className="card">
          <div className="card-h">
            团款组成
            {canEditFinance && !quoteEdit && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setQuoteEdit(true)}>
                编辑
              </button>
            )}
          </div>
          <div className="card-b">
            {quoteItems.length === 0 && !quoteEdit ? (
              <EmptyState
                title="暂无团款明细"
                description="按单价填写（人均或每组），可加可减，不是整团一口价"
                action={
                  canEditFinance ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setQuoteDraft([{ ...emptyQuoteDraft(), key: `q${Date.now()}` }]);
                        setQuoteEdit(true);
                      }}
                    >
                      + 添加一行
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <QuoteItemsEditor
                  lines={quoteEdit ? quoteDraft : quoteLinesFromItems(quoteItems)}
                  onChange={setQuoteDraft}
                  paxAdult={project.paxAdult}
                  paxChild={project.paxChild}
                  readOnly={!quoteEdit}
                />
                {quoteEdit && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setQuoteEdit(false);
                        setQuoteDraft(quoteLinesFromItems(quoteItems));
                      }}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (!guardWrite('保存团款组成')) return;
                        const valid = quoteDraft.filter((l) => l.itemLabel.trim() && l.unitPriceCents > 0);
                        setQuoteItems(
                          project.id,
                          valid.map(({ itemLabel, direction, unitPriceCents, pricingUnit, quantity, remark }) => ({
                            itemLabel,
                            direction: direction ?? 'add',
                            unitPriceCents,
                            pricingUnit,
                            quantity,
                            remark,
                          })),
                        );
                        setQuoteEdit(false);
                        toast('团款组成已保存');
                      }}
                    >
                      保存
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'outsource' && project.bizType === 'outsourced_out' && (
        <div className="card">
          <div className="card-h">
            拼出分项
            {canEditFinance && !outsourceEdit && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setOutsourceEdit(true)}>
                编辑
              </button>
            )}
          </div>
          <div className="card-b">
            {outsourceItems.length === 0 && !outsourceEdit ? (
              <EmptyState
                title="暂无拼出明细"
                description="记录拼出给谁、单价与执行标准，便于与同行对账"
                action={
                  canEditFinance ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setOutsourceDraft([
                          {
                            ...emptyOutsourceDraft(project.outsourcedToPartnerId ?? peerPartners[0]?.id ?? ''),
                            key: `o${Date.now()}`,
                          },
                        ]);
                        setOutsourceEdit(true);
                      }}
                    >
                      + 添加一行
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <OutsourceItemsEditor
                  lines={outsourceEdit ? outsourceDraft : outsourceLinesFromItems(outsourceItems)}
                  onChange={setOutsourceDraft}
                  peers={peerPartners}
                  fixedPeerId={project.outsourcedToPartnerId}
                  hidePeerHint
                  paxAdult={project.paxAdult}
                  paxChild={project.paxChild}
                  quoteItems={quoteItems}
                  readOnly={!outsourceEdit}
                />
                {outsourceEdit && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setOutsourceEdit(false);
                        setOutsourceDraft(outsourceLinesFromItems(outsourceItems));
                      }}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (!guardWrite('保存拼出明细')) return;
                        const valid = outsourceDraft.filter(
                          (l) => l.itemLabel.trim() && l.unitPriceCents > 0,
                        );
                        setOutsourceItems(
                          project.id,
                          valid.map(
                            ({ itemLabel, unitPriceCents, pricingUnit, quantity, standard, remark }) => ({
                              peerPartnerId: project.outsourcedToPartnerId ?? '',
                              itemLabel,
                              unitPriceCents,
                              pricingUnit,
                              quantity,
                              standard,
                              remark,
                            }),
                          ),
                        );
                        if (hasOutsourcePayable) {
                          syncOutsourcePayableSchedule(project.id);
                          toast('拼出明细已保存，应付节点金额已同步');
                        } else {
                          toast('拼出明细已保存');
                        }
                        setOutsourceEdit(false);
                      }}
                    >
                      保存
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <>
          <div className="fsum">
            <div>
              <span className="text-muted">应收合计</span>
              <div className="big text-primary">{formatMoney(finance.incomeCents)}</div>
            </div>
            <div>
              <span className="text-muted">成本合计</span>
              <div className="big text-danger">{formatMoney(finance.expenseCents)}</div>
            </div>
            <div>
              <span className="text-muted">毛利</span>
              <div className={`big ${finance.profitCents < 0 ? 'text-danger' : ''}`}>
                {formatMoney(finance.profitCents)}
                {finance.incomeCents > 0 && (
                  <small className="text-muted" style={{ fontSize: 12, marginLeft: 8 }}>
                    毛利率 {Math.round((finance.profitCents / finance.incomeCents) * 100)}%
                  </small>
                )}
              </div>
            </div>
          </div>
          {canEditFinance && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setTxDirection('income');
                  setTxDrawer(true);
                }}
              >
                + 记一笔收入
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setTxDirection('expense');
                  setTxDrawer(true);
                }}
              >
                + 记一笔支出
              </button>
            </div>
          )}
          <div className="card">
            {txs.length === 0 ? (
              <EmptyState title="暂无收支明细" description="记录第一笔收入或支出" />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>方向</th>
                    <th>分类</th>
                    <th>说明</th>
                    <th>供应商</th>
                    <th>金额</th>
                    <th>操作人</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {txs.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDateShort(t.date)}</td>
                      <td>{t.direction === 'income' ? '收' : '支'}</td>
                      <td>
                        {SUPPLIER_CATEGORY_LABELS[t.category] ?? INCOME_CATEGORIES[t.category] ?? t.category}
                      </td>
                      <td>{t.note ?? '—'}</td>
                      <td>{t.supplierId ? getSupplierName(t.supplierId) : '—'}</td>
                      <td className={t.direction === 'income' ? '' : 'text-danger'}>
                        {t.direction === 'income' ? '+' : '-'}
                        {formatMoney(t.amountCents)}
                      </td>
                      <td>{getUserName(t.createdBy)}</td>
                      <td>
                        {canEditFinance && (
                          <RowActions
                            items={[
                              {
                                label: '复制为新支出',
                                onClick: () => {
                                  addTransaction({
                                    projectId: project.id,
                                    direction: 'expense',
                                    category: t.category,
                                    amountCents: t.amountCents,
                                    supplierId: t.supplierId,
                                    date: dayjs().format('YYYY-MM-DD'),
                                    note: `复制自 ${t.note ?? ''}`,
                                  });
                                  toast('已复制为新支出');
                                },
                              },
                              {
                                label: '删除',
                                danger: true,
                                onClick: () => toast('删除功能 v1.5 演示'),
                              },
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'schedules' && (
        <>
          {canEditFinance && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (guardWrite('添加节点模板')) addScheduleTemplate(project.id, 'deposit_tail');
                  toast('已添加定金/尾款模板');
                }}
              >
                + 定金/尾款模板
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setScheduleDrawer(true)}>
                + 自定义节点
              </button>
              {project.bizType === 'outsourced_out' && outsourceItems.length > 0 && !hasOutsourcePayable && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (!guardWrite('生成拼出应付')) return;
                    if (addOutsourcePayableSchedule(project.id)) {
                      toast('已生成拼出应付节点');
                    }
                  }}
                >
                  + 生成拼出应付
                </button>
              )}
            </div>
          )}
          <div className="card">
            {schedules.length === 0 ? (
              <EmptyState
                title="暂无收付款节点"
                description={
                  project.bizType === 'outsourced_out' && outsourceItems.length > 0
                    ? outsourceFin.pendingCents > 0
                      ? `待付 ${formatMoney(outsourceFin.pendingCents)}，可对同行分次结账`
                      : '拼出团可生成应付同行节点，便于到期提醒'
                    : '添加定金/尾款或自定义应收应付节点'
                }
                action={
                  canEditFinance ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {project.bizType === 'outsourced_out' && outsourceFin.pendingCents > 0 ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={openSettleDialog}>
                          应付结账
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => addScheduleTemplate(project.id, 'deposit_tail')}
                          >
                            + 定金/尾款模板
                          </button>
                          {project.bizType === 'outsourced_out' && outsourceItems.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                if (guardWrite('生成拼出应付')) addOutsourcePayableSchedule(project.id);
                                toast('已生成拼出应付节点');
                              }}
                            >
                              + 生成拼出应付
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : undefined
                }
              />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>方向</th>
                    <th>对象</th>
                    <th>款项</th>
                    <th>金额</th>
                    <th>到期</th>
                    <th>状态</th>
                    <th>操作</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const od = isOverdue(s.dueDate, s.status);
                    return (
                      <tr key={s.id} className={highlightScheduleId === s.id ? 'highlight-row' : ''}>
                        <td>
                          {s.sourceKind === 'outsource' && <OutsourceSourceBadge />}
                          {s.direction === 'receivable' ? '应收' : '应付'}
                        </td>
                        <td>{s.counterpartyName}</td>
                        <td>{s.title}</td>
                        <td>{formatMoney(s.amountCents)}</td>
                        <td>
                          {s.dueDate}
                          {od && (
                            <span className="text-danger"> （逾期{dayjs().diff(dayjs(s.dueDate), 'day')}天）</span>
                          )}
                        </td>
                        <td>
                          <ScheduleBadge status={s.status} overdue={od} />
                        </td>
                        <td>
                          {s.status === 'pending' && canEditFinance && (
                            s.sourceKind === 'outsource' ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={openSettleDialog}
                              >
                                结账
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  markScheduleDone(s.id);
                                  toast('已标记并联动记账');
                                }}
                              >
                                标记{s.direction === 'receivable' ? '已收' : '已付'}
                              </button>
                            )
                          )}
                        </td>
                        <td>
                          <RowActions
                            items={[
                              {
                                label: '查看联动明细',
                                onClick: () => {
                                  if (s.doneTxnId) switchTab('transactions');
                                  else toast('尚未完成，无联动明细');
                                },
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Drawer
        open={txDrawer}
        title={txDirection === 'income' ? '记一笔收入' : '记一笔支出'}
        onClose={() => setTxDrawer(false)}
      >
        <form onSubmit={saveTx}>
          <div className="form-g">
            <label>分类</label>
            {txDirection === 'income' ? (
              <select name="category" defaultValue="group_fee">
                <option value="group_fee">团款</option>
                <option value="other_income">其他收入</option>
              </select>
            ) : (
              <select name="category" defaultValue="transport">
                {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-g">
            <label>金额（元）</label>
            <input value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="9600" required />
            {showBigWarn && <div className="warn-box">⚠ 金额超过 ¥100,000，请确认是否输入有误</div>}
          </div>
          {txDirection === 'expense' && (
            <div className="form-g">
              <label>供应商</label>
              <select name="supplierId" defaultValue={suppliers.find((s) => s.category === 'transport')?.id}>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-g">
            <label>备注</label>
            <input name="note" placeholder="说明" />
          </div>
          <button type="submit" className="btn btn-primary">
            保存
          </button>
        </form>
      </Drawer>

      <Drawer open={scheduleDrawer} title="自定义收付款节点" onClose={() => setScheduleDrawer(false)}>
        <form onSubmit={addCustomSchedule}>
          <div className="form-g">
            <label>方向</label>
            <select name="direction" defaultValue="receivable">
              <option value="receivable">应收</option>
              <option value="payable">应付</option>
            </select>
          </div>
          <div className="form-g">
            <label>对象</label>
            <input name="counterparty" defaultValue={partner?.name ?? ''} required />
          </div>
          <div className="form-g">
            <label>款项名称</label>
            <input name="title" placeholder="定金/尾款/房费" required />
          </div>
          <div className="form-g">
            <label>金额（元）</label>
            <input name="amount" type="number" required />
          </div>
          <div className="form-g">
            <label>到期日</label>
            <input name="dueDate" type="date" defaultValue={dayjs().add(7, 'day').format('YYYY-MM-DD')} required />
          </div>
          <button type="submit" className="btn btn-primary">
            添加
          </button>
        </form>
      </Drawer>

      <OutsourceSettlementDialog
        open={settleDialogOpen}
        peerName={peerName}
        pendingCents={outsourceFin.pendingCents}
        onClose={() => setSettleDialogOpen(false)}
        onConfirm={confirmOutsourceSettle}
      />

      {settleConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>确认结清？</h3>
            <p className="text-muted">
              仍有 <strong>{pendingSchedules.length}</strong> 笔待办节点未完成，结清后建议核对账目。
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSettleConfirm(false)}>
                取消
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmSettle}>
                仍要结清
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>取消团</h3>
            <div className="form-g">
              <label>取消原因 *</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setCancelOpen(false)}>
                返回
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmCancel}>
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
