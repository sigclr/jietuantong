import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { formatMoney } from '../../utils/format';
import { StatusBadge } from '../../components/StatusBadge';

export function PartnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPartner, projects, paymentSchedules, projectFinance } = useApp();
  const partner = getPartner(id ?? '');

  if (!partner) {
    return <p>合作方不存在</p>;
  }

  const history = projects.filter((p) => p.partnerId === partner.id);
  const unpaid = paymentSchedules.filter(
    (s) => s.counterpartyName === partner.name && s.direction === 'receivable' && s.status === 'pending',
  );

  return (
    <>
      <div className="page-header">
        <h1>
          <Link to="/partners" className="text-muted">
            ← 合作方
          </Link>{' '}
          / {partner.name}
        </h1>
        <button type="button" className="btn btn-outline">
          编辑
        </button>
      </div>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        联系人 {partner.contact} · {partner.phone} · 账期 {partner.settlementDays} 天
      </p>

      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="label">累计团数</div>
          <div className="value" style={{ fontSize: 22 }}>
            {history.length} 团
          </div>
        </div>
        <div className="stat-card">
          <div className="label">未结清应收</div>
          <div className={`value ${unpaid.length ? 'danger' : ''}`} style={{ fontSize: 22 }}>
            {formatMoney(unpaid.reduce((s, x) => s + x.amountCents, 0))}
          </div>
        </div>
      </div>

      {unpaid.length > 0 && (
        <div className="card">
          <div className="card-h">未结清明细</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>团号</th>
                <th>款项</th>
                <th>金额</th>
                <th>到期</th>
              </tr>
            </thead>
            <tbody>
              {unpaid.map((s) => {
                const proj = projects.find((p) => p.id === s.projectId);
                return (
                  <tr key={s.id}>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/projects/${proj?.groupNo}`);
                        }}
                      >
                        {proj?.groupNo}
                      </a>
                    </td>
                    <td>{s.title}</td>
                    <td className="text-danger">{formatMoney(s.amountCents)}</td>
                    <td>{s.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-h">历史接团单</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>团号</th>
              <th>线路</th>
              <th>人数</th>
              <th>状态</th>
              <th>毛利</th>
            </tr>
          </thead>
          <tbody>
            {history.map((p) => {
              const fin = projectFinance(p.id);
              return (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.groupNo}`)}>
                  <td>{p.groupNo}</td>
                  <td>{p.title}</td>
                  <td>
                    {p.paxAdult}+{p.paxChild}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{fin.profitCents ? formatMoney(fin.profitCents) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
