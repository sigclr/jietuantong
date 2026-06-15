import { Link } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { formatMoney, formatDateShort } from '../../utils/format';

const CAT_LABEL: Record<string, string> = {
  hotel: '酒店',
  fleet: '用车',
  guide: '导服',
  ticket: '门票',
  restaurant: '餐饮',
  receivable: '团款',
};

export function FinanceListPage() {
  const { transactions, projects, getPartnerName, getSupplierName } = useApp();

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="page-header">
        <h1>全局收支流水</h1>
      </div>

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
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>团号</th>
              <th>方向</th>
              <th>分类</th>
              <th>项目</th>
              <th>对方</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              const total = t.unitPriceCents * t.quantity;
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
                    {proj ? (
                      <Link to={`/projects/${proj.groupNo}`}>{proj.groupNo}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{t.direction === 'income' ? '收' : '支'}</td>
                  <td>{CAT_LABEL[t.category] ?? t.category}</td>
                  <td>{t.itemName}</td>
                  <td>{counterparty}</td>
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
  );
}
