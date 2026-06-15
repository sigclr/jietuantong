import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { formatMoney } from '../../utils/format';
import { Drawer } from '../../components/Drawer';

export function PartnerListPage() {
  const { partners, projects, addPartner } = useApp();
  const { canManagePartners, guardWrite } = useRole();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');

  const projectCount = (partnerId: string) => projects.filter((p) => p.partnerId === partnerId).length;

  const save = () => {
    if (!guardWrite('新增合作方')) return;
    if (!name.trim()) return;
    addPartner({
      name: name.trim(),
      contact: '',
      phone: '',
      settlementDays: 30,
    });
    setName('');
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="page-header">
        <h1>合作方（组团社）</h1>
        {canManagePartners && (
          <button type="button" className="btn btn-primary" onClick={() => setDrawerOpen(true)}>
            + 新增合作方
          </button>
        )}
      </div>

      <div className="toolbar">
        <input placeholder="搜索名称/联系人…" style={{ width: 220 }} />
        <select>
          <option>按累计团数</option>
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>联系人</th>
              <th>电话</th>
              <th>累计团数</th>
              <th>未结清应收</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/partners/${p.id}`)}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>{p.contact}</td>
                <td>{p.phone}</td>
                <td>{projectCount(p.id)}</td>
                <td className={p.unpaidReceivableCents ? 'text-danger' : ''}>
                  {formatMoney(p.unpaidReceivableCents || 0)}
                  {p.unpaidReceivableCents > 0 && ' ⚠'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} title="新增合作方" onClose={() => setDrawerOpen(false)}>
        <div className="form-g">
          <label>组团社名称 *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：上海国旅" />
        </div>
        <div className="form-g">
          <label>联系人</label>
          <input placeholder="张经理" />
        </div>
        <div className="form-g">
          <label>电话</label>
          <input placeholder="138xxxxxxxx" />
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          保存
        </button>
      </Drawer>
    </>
  );
}
