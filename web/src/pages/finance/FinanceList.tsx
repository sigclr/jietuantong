import { Link } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { formatMoney, formatDateShort, SUPPLIER_CATEGORY_LABELS, INCOME_CATEGORIES } from '../../utils/format';
import { EmptyState } from '../../components/EmptyState';

export function FinanceListPage() {
  const { transactions, projects, getPartnerName, getSupplierName, agingByPartner, toast } = useApp();
  const { isFinance, canExport } = useRole();

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const aging = agingByPartner();

  const exportDemo = (type: string) => {
    if (canExport) toast(`「${type}」v1.5 功能演示`);
    else toast('无导出权限');
  };

  return (
    <>
      <div className="page-header">
        <h1>{isFinance ? '财务中心' : '全局收支流水'}</h1>
        {canExport && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => exportDemo('导出对账单')}>
              导出对账单
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => exportDemo('导出流水 CSV')}>
              导出流水 CSV
            </button>
          </div>
        )}
      </div>

      {isFinance && (
        <div className="card">
          <div className="card-h">应收账龄简表（按合作方）</div>
          {aging.length === 0 ? (
            <EmptyState title="暂无待收账款" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>合作方</th>
                  <th>待收合计</th>
                  <th>其中逾期</th>
                  <th>最长逾期</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((row) => (
                  <tr key={row.partnerId}>
                    <td>
                      <Link to={`/partners/${row.partnerId}`}>{row.partnerName}</Link>
                    </td>
                    <td>{formatMoney(row.pendingCents)}</td>
                    <td className={row.overdueCents ? 'text-danger' : ''}>
                      {row.overdueCents ? formatMoney(row.overdueCents) : '—'}
                    </td>
                    <td>{row.maxOverdueDays ? `${row.maxOverdueDays} 天` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="toolbar">
        <input placeholder="搜索团号…" style={{ width: 180 }} />
        <select>
          <option>全部类型</option>
          <option>收入</option>
          <option>支出</option>
        </select>
        <input type="month" defaultValue="2026-06" />
      </div>

      <div className="card">
        <div className="card-h">收支流水</div>
        {sorted.length === 0 ? (
          <EmptyState title="暂无流水" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>团号</th>
                <th>方向</th>
                <th>分类</th>
                <th>说明</th>
                <th>对方</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                const counterparty =
                  t.direction === 'income'
                    ? proj
                      ? getPartnerName(proj.partnerId)
                      : '—'
                    : t.supplierId
                      ? getSupplierName(t.supplierId)
                      : '—';
                return (
                  <tr key={t.id}>
                    <td>{formatDateShort(t.date)}</td>
                    <td>
                      {proj ? <Link to={`/projects/${proj.groupNo}`}>{proj.groupNo}</Link> : '—'}
                    </td>
                    <td>{t.direction === 'income' ? '收' : '支'}</td>
                    <td>
                      {SUPPLIER_CATEGORY_LABELS[t.category] ?? INCOME_CATEGORIES[t.category] ?? t.category}
                    </td>
                    <td>{t.note ?? '—'}</td>
                    <td>{counterparty}</td>
                    <td className={t.direction === 'income' ? '' : 'text-danger'}>
                      {t.direction === 'income' ? '+' : '-'}
                      {formatMoney(t.amountCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
