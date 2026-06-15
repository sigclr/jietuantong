import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { formatMoney, formatDateShort } from '../../utils/format';
import { StatusBadge } from '../../components/StatusBadge';

export function ProjectListPage() {
  const { projects, getPartnerName } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.groupNo.includes(search) && !p.title.includes(search)) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <h1>接团单</h1>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/projects/new')}>
          + 新建接团单
        </button>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">全部状态</option>
          <option value="pending">待确认</option>
          <option value="ongoing">执行中</option>
          <option value="completed">已结团</option>
        </select>
        <input placeholder="搜索团号/团名…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>团号</th>
              <th>团名/线路</th>
              <th>组团社</th>
              <th>人数</th>
              <th>起止日期</th>
              <th>状态</th>
              <th>毛利</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.groupNo}`)}>
                <td>
                  <strong>{p.groupNo}</strong>
                </td>
                <td>{p.title}</td>
                <td>{getPartnerName(p.partnerId)}</td>
                <td>{p.pax}</td>
                <td>
                  {formatDateShort(p.startDate)}-{formatDateShort(p.endDate)}
                </td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className={p.grossProfitCents >= 0 ? '' : 'text-danger'}>
                  {p.grossProfitCents ? formatMoney(p.grossProfitCents) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
