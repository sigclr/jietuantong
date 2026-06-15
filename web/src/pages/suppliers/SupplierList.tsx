import { useState } from 'react';
import { useApp } from '../../mocks/store';
import { formatMoney } from '../../utils/format';

const CAT_LABEL: Record<string, string> = {
  hotel: '酒店',
  fleet: '用车',
  guide: '导服',
  ticket: '门票',
  restaurant: '餐饮',
  other: '其他',
};

export function SupplierListPage() {
  const { suppliers, transactions } = useApp();
  const [cat, setCat] = useState('all');

  const costBySupplier = (id: string) =>
    transactions.filter((t) => t.supplierId === id && t.direction === 'expense').reduce((s, t) => s + t.unitPriceCents * t.quantity, 0);

  const filtered = cat === 'all' ? suppliers : suppliers.filter((s) => s.category === cat);

  return (
    <>
      <div className="page-header">
        <h1>供应商</h1>
        <button type="button" className="btn btn-primary">
          + 新增供应商
        </button>
      </div>

      <div className="toolbar">
        {['all', 'hotel', 'fleet', 'restaurant', 'ticket', 'guide'].map((c) => (
          <button
            key={c}
            type="button"
            className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCat(c)}
          >
            {c === 'all' ? '全部' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>结算方式</th>
              <th>累计成本</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                </td>
                <td>{CAT_LABEL[s.category] ?? s.category}</td>
                <td>{s.settlementNote}</td>
                <td>{formatMoney(costBySupplier(s.id))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
