import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { formatMoney, SUPPLIER_CATEGORY_LABELS } from '../../utils/format';
import { EmptyState } from '../../components/EmptyState';

export function SupplierListPage() {
  const { suppliers, transactions, addSupplier, toast } = useApp();
  const { canManagePartners, guardWrite } = useRole();
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const costBySupplier = (id: string) =>
    transactions
      .filter((t) => t.supplierId === id && t.direction === 'expense')
      .reduce((s, t) => s + t.amountCents, 0);

  const filtered = cat === 'all' ? suppliers : suppliers.filter((s) => s.category === cat);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guardWrite('新增供应商')) return;
    const fd = new FormData(e.currentTarget);
    addSupplier({
      name: fd.get('name') as string,
      category: fd.get('category') as 'hotel',
      settlementNote: (fd.get('settlementNote') as string) || '月结',
    });
    setShowForm(false);
    toast('供应商已添加');
  };

  return (
    <>
      <div className="page-header">
        <h1>供应商</h1>
        {canManagePartners && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + 新增供应商
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-b">
            <form onSubmit={handleAdd} className="grid2">
              <div className="form-g">
                <label>名称</label>
                <input name="name" required />
              </div>
              <div className="form-g">
                <label>类型</label>
                <select name="category" defaultValue="hotel">
                  {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-g">
                <label>结算方式</label>
                <input name="settlementNote" defaultValue="月结" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="toolbar">
        {['all', 'hotel', 'transport', 'restaurant', 'ticket', 'guide'].map((c) => (
          <button
            key={c}
            type="button"
            className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCat(c)}
          >
            {c === 'all' ? '全部' : SUPPLIER_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState title="暂无供应商" description="添加酒店、车队等合作供应商" />
        ) : (
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
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/suppliers/${s.id}`)}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>{SUPPLIER_CATEGORY_LABELS[s.category] ?? s.category}</td>
                  <td>{s.settlementNote}</td>
                  <td>{formatMoney(costBySupplier(s.id))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
