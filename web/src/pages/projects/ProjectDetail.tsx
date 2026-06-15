import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApp } from '../../mocks/store';
import { formatMoney, formatDateShort, isOverdue } from '../../utils/format';
import { StatusBadge, ScheduleBadge } from '../../components/StatusBadge';
import { Drawer } from '../../components/Drawer';

const CATEGORY_LABEL: Record<string, string> = {
  hotel: '酒店',
  fleet: '用车',
  guide: '导服',
  ticket: '门票',
  restaurant: '餐饮',
  receivable: '团款',
  other: '其他',
};

export function ProjectDetailPage() {
  const { id } = useParams();
  const {
    getProject,
    getPartnerName,
    getSupplierName,
    paymentSchedules,
    transactions,
    suppliers,
    markScheduleDone,
    updateProjectStatus,
    addTransaction,
    highlightScheduleId,
    setHighlightSchedule,
    projectDetailTab,
    setProjectDetailTab,
    projectFinance,
  } = useApp();

  const project = getProject(id ?? '');
  const [tab, setTab] = useState(projectDetailTab);
  const [txDrawer, setTxDrawer] = useState(false);
  const [amount, setAmount] = useState('');
  const [showBigWarn, setShowBigWarn] = useState(false);

  useEffect(() => {
    setTab(projectDetailTab);
  }, [projectDetailTab]);

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

  const switchTab = (t: 'basic' | 'transactions' | 'schedules') => {
    setTab(t);
    setProjectDetailTab(t);
  };

  const saveTx = () => {
    const yuan = parseFloat(amount);
    if (!yuan || yuan <= 0) return;
    const cents = Math.round(yuan * 100);
    addTransaction({
      projectId: project.id,
      direction: 'expense',
      category: 'fleet',
      itemName: '用车追加',
      supplierId: suppliers.find((s) => s.name.includes('西域'))?.id,
      unitPriceCents: cents,
      quantity: 1,
      date: dayjs().format('YYYY-MM-DD'),
      note: '原型录入',
    });
    setAmount('');
    setTxDrawer(false);
    setShowBigWarn(false);
  };

  const onAmountChange = (v: string) => {
    setAmount(v);
    const yuan = parseFloat(v);
    setShowBigWarn(!isNaN(yuan) && yuan > 100000);
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
        <select
          value={project.status}
          onChange={(e) => updateProjectStatus(project.id, e.target.value as typeof project.status)}
          style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border)' }}
        >
          <option value="pending">待确认</option>
          <option value="ongoing">执行中</option>
          <option value="completed">已结团</option>
          <option value="settling">结算中</option>
        </select>
      </div>

      <p style={{ marginBottom: 12 }}>
        <strong>{project.title}</strong> · {getPartnerName(project.partnerId)} · {project.pax}人 ·{' '}
        {formatDateShort(project.startDate)}-{formatDateShort(project.endDate)} · <StatusBadge status={project.status} />
      </p>

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'basic' ? 'active' : ''}`} onClick={() => switchTab('basic')}>
          基本信息
        </button>
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
              <span className="text-muted">领队</span>
              <div>
                {project.leaderName} {project.leaderPhone}
              </div>
            </div>
            <div>
              <span className="text-muted">备注</span>
              <div>{project.remark || '—'}</div>
            </div>
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
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setTxDrawer(true)}>
              + 记一笔支出
            </button>
          </div>
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>方向</th>
                  <th>分类</th>
                  <th>项目</th>
                  <th>供应商</th>
                  <th>金额</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => {
                  const total = t.unitPriceCents * t.quantity;
                  return (
                    <tr key={t.id}>
                      <td>{formatDateShort(t.date)}</td>
                      <td>{t.direction === 'income' ? '收' : '支'}</td>
                      <td>{CATEGORY_LABEL[t.category] ?? t.category}</td>
                      <td>{t.itemName}</td>
                      <td>{t.supplierId ? getSupplierName(t.supplierId) : '—'}</td>
                      <td className={t.direction === 'income' ? '' : 'text-danger'}>
                        {t.direction === 'income' ? '+' : '-'}
                        {formatMoney(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'schedules' && (
        <>
          <div className="card">
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
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  const od = isOverdue(s.dueDate, s.status);
                  return (
                    <tr key={s.id} className={highlightScheduleId === s.id ? 'highlight-row' : ''}>
                      <td>{s.direction === 'receivable' ? '应收' : '应付'}</td>
                      <td>{s.counterpartyName}</td>
                      <td>{s.phase}</td>
                      <td>{formatMoney(s.amountCents)}</td>
                      <td>
                        {s.dueDate}
                        {od && <span className="text-danger"> （逾期{dayjs().diff(dayjs(s.dueDate), 'day')}天）</span>}
                      </td>
                      <td>
                        <ScheduleBadge status={s.status} overdue={od} />
                      </td>
                      <td>
                        {s.status === 'pending' && (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => markScheduleDone(s.id)}>
                            标记{s.direction === 'receivable' ? '已收' : '已付'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Drawer open={txDrawer} title="记一笔支出" onClose={() => setTxDrawer(false)}>
        <div className="form-g">
          <label>分类</label>
          <select defaultValue="fleet">
            <option value="fleet">用车</option>
            <option value="hotel">酒店</option>
          </select>
        </div>
        <div className="form-g">
          <label>金额（元）</label>
          <input value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="9600" />
          {showBigWarn && (
            <div className="warn-box">⚠ 金额超过 ¥100,000，请确认是否输入有误</div>
          )}
        </div>
        <div className="form-g">
          <label>供应商</label>
          <select defaultValue={suppliers.find((s) => s.name.includes('西域'))?.id}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={saveTx}>
          保存
        </button>
      </Drawer>
    </>
  );
}
