import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { formatMoney, formatDateShort } from '../../utils/format';
import { StatusBadge, BizTypeBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { RowActions } from '../../components/RowActions';

export function ProjectListPage() {
  const { projects, getPartnerName, projectFinance, opStats } = useApp();
  const { canCreateProject, isOp, guardWrite } = useRole();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const stats = opStats();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (canCreateProject) navigate('/projects/new');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canCreateProject, navigate]);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.groupNo.includes(search) && !p.title.includes(search)) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <h1>接团单</h1>
        {canCreateProject && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            + 新建接团单
          </button>
        )}
      </div>

      {isOp && (
        <div className="op-quickbar">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>
            + 新建接团单
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const first = projects.find((p) => p.status === 'ongoing');
              if (first) navigate(`/projects/${first.groupNo}`);
            }}
          >
            记一笔支出
          </button>
          <input
            className="op-quickbar-search"
            placeholder="搜索团号…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="op-quickbar-stats">
            在途 {stats.ongoing} 团 · 待办节点 {stats.pendingSchedules} 笔
          </span>
        </div>
      )}

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">全部状态</option>
          <option value="pending">待确认</option>
          <option value="ongoing">进行中</option>
          <option value="completed">已完成</option>
          <option value="settled">已结清</option>
          <option value="cancelled">已取消</option>
        </select>
        {!isOp && (
          <input placeholder="搜索团号/团名…" value={search} onChange={(e) => setSearch(e.target.value)} />
        )}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            title="暂无接团单"
            description="创建第一笔接团单，开始管理行程与收支"
            action={
              canCreateProject ? (
                <button type="button" className="btn btn-primary" onClick={() => navigate('/projects/new')}>
                  + 新建接团单
                </button>
              ) : undefined
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>团号</th>
                <th>团名/线路</th>
                <th>组团社</th>
                <th>类型</th>
                <th>人数</th>
                <th>起止日期</th>
                <th>状态</th>
                <th>毛利</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const fin = projectFinance(p.id);
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.groupNo}`)}>
                    <td>
                      <strong>{p.groupNo}</strong>
                    </td>
                    <td>{p.title}</td>
                    <td>{getPartnerName(p.partnerId)}</td>
                    <td>
                      <BizTypeBadge bizType={p.bizType} />
                    </td>
                    <td>
                      {p.paxAdult}+{p.paxChild}
                    </td>
                    <td>
                      {formatDateShort(p.startDate)}-{formatDateShort(p.endDate)}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className={fin.profitCents >= 0 ? '' : 'text-danger'}>
                      {fin.profitCents ? formatMoney(fin.profitCents) : '—'}
                    </td>
                    <td>
                      <RowActions
                        items={[
                          {
                            label: '查看详情',
                            onClick: () => navigate(`/projects/${p.groupNo}`),
                          },
                          {
                            label: '记一笔',
                            onClick: () => {
                              if (guardWrite('记一笔')) navigate(`/projects/${p.groupNo}`);
                            },
                          },
                        ]}
                      />
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
