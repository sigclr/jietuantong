import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { formatMoney, formatDateShort, SUPPLIER_CATEGORY_LABELS } from '../../utils/format';

export function SupplierDetailPage() {
  const { id } = useParams();
  const { getSupplier, transactions, projects } = useApp();
  const supplier = getSupplier(id ?? '');

  if (!supplier) {
    return <p>供应商不存在</p>;
  }

  const txs = transactions
    .filter((t) => t.supplierId === supplier.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalCost = txs.filter((t) => t.direction === 'expense').reduce((s, t) => s + t.amountCents, 0);

  return (
    <>
      <div className="page-header">
        <h1>
          <Link to="/suppliers" className="text-muted">
            ← 供应商
          </Link>{' '}
          / {supplier.name}
        </h1>
      </div>

      <div className="card">
        <div className="card-b grid2">
          <div>
            <span className="text-muted">类型</span>
            <div>{SUPPLIER_CATEGORY_LABELS[supplier.category] ?? supplier.category}</div>
          </div>
          <div>
            <span className="text-muted">结算方式</span>
            <div>{supplier.settlementNote}</div>
          </div>
          <div>
            <span className="text-muted">联系人</span>
            <div>{supplier.contactName ?? '—'}</div>
          </div>
          <div>
            <span className="text-muted">累计成本</span>
            <div className="text-danger">{formatMoney(totalCost)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">关联收支</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>团号</th>
              <th>说明</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
                  暂无关联流水
                </td>
              </tr>
            ) : (
              txs.map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                return (
                  <tr key={t.id}>
                    <td>{formatDateShort(t.date)}</td>
                    <td>
                      {proj ? <Link to={`/projects/${proj.groupNo}`}>{proj.groupNo}</Link> : '—'}
                    </td>
                    <td>{t.note ?? t.category}</td>
                    <td className="text-danger">-{formatMoney(t.amountCents)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
