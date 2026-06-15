import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApp } from '../mocks/store';
import { formatMoney } from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardStats, overdueSchedules, projects, paymentSchedules, getPartnerName, setHighlightSchedule, setProjectDetailTab } =
    useApp();
  const stats = dashboardStats();
  const overdue = overdueSchedules();
  const recent = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 5);

  const pendingNotOverdue = paymentSchedules.filter(
    (s) => s.status === 'pending' && !overdue.find((o) => o.id === s.id),
  );
  const todoList = [...overdue, ...pendingNotOverdue]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8);

  const goSchedule = (scheduleId: string, groupNo: string) => {
    setHighlightSchedule(scheduleId);
    setProjectDetailTab('schedules');
    navigate(`/projects/${groupNo}`);
  };

  return (
    <>
      <div className="page-header">
        <h1>工作台</h1>
        <span className="text-muted">{dayjs().format('YYYY年M月D日 dddd')}</span>
      </div>

      {stats.overdueReceivableCount > 0 && (
        <div className="alert-bar">
          <span>
            有 <strong>{stats.overdueReceivableCount}</strong> 笔应收已逾期，合计{' '}
            <strong>{formatMoney(stats.overdueReceivableCents)}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => overdue[0] && goSchedule(overdue[0].id, overdue[0].project?.groupNo ?? '')}
          >
            查看 →
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">本月接团</div>
          <div className="value">{stats.monthProjects} 团</div>
        </div>
        <div className="stat-card">
          <div className="label">在途团</div>
          <div className="value">{stats.ongoing} 团</div>
        </div>
        <div className="stat-card">
          <div className="label">本月毛利</div>
          <div className="value">{formatMoney(stats.monthProfitCents)}</div>
        </div>
        <div className="stat-card">
          <div className="label">逾期应收</div>
          <div className={`value ${stats.overdueReceivableCount ? 'danger' : ''}`}>
            {formatMoney(stats.overdueReceivableCents)} / {stats.overdueReceivableCount}笔
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">待办结算节点（按到期日升序）</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>方向</th>
              <th>对象</th>
              <th>团号</th>
              <th>款项</th>
              <th>金额</th>
            </tr>
          </thead>
          <tbody>
            {todoList.map((s) => {
                const proj = projects.find((p) => p.id === s.projectId);
                const isOd = s.status === 'pending' && dayjs(s.dueDate).isBefore(dayjs(), 'day');
                const daysUntil = dayjs(s.dueDate).diff(dayjs(), 'day');
                return (
                  <tr
                    key={s.id}
                    className="clickable"
                    style={{ cursor: 'pointer' }}
                    onClick={() => proj && goSchedule(s.id, proj.groupNo)}
                  >
                    <td>
                      {isOd ? (
                        <span className="text-danger">⚠ 逾期 {dayjs().diff(dayjs(s.dueDate), 'day')} 天</span>
                      ) : daysUntil <= 3 ? (
                        <span>● {daysUntil} 天后到期</span>
                      ) : (
                        <span className="text-muted">待办</span>
                      )}
                    </td>
                    <td>{s.direction === 'receivable' ? '收' : '付'}</td>
                    <td>{s.counterpartyName}</td>
                    <td>{proj?.groupNo}</td>
                    <td>{s.phase}</td>
                    <td>{formatMoney(s.amountCents)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h">
          最近接团单
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>
            + 新建接团单
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>团号</th>
              <th>线路</th>
              <th>组团社</th>
              <th>人数</th>
              <th>状态</th>
              <th>毛利</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/projects/${p.groupNo}`)}
              >
                <td>
                  <strong>{p.groupNo}</strong>
                </td>
                <td>{p.title}</td>
                <td>{getPartnerName(p.partnerId)}</td>
                <td>{p.pax}人</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className={p.grossProfitCents >= 0 ? 'text-primary' : 'text-danger'}>
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
