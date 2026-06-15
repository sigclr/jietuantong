import { useState } from 'react';
import { useApp } from '../../mocks/store';

export function TeamPage() {
  const { users, invites, organization } = useApp();
  const [copied, setCopied] = useState(false);
  const invite = invites[0];
  const link = `${window.location.origin}/join/${invite?.code ?? '8FK2-9D3A'}`;

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const roleLabel = (role: string) => (role === 'owner' ? '老板(owner)' : '员工(member)');

  return (
    <>
      <div className="page-header">
        <h1>员工（{users.length}/10）</h1>
        <button type="button" className="btn btn-primary">
          + 生成邀请链接
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色</th>
              <th>手机</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{roleLabel(u.role)}</td>
                <td>{u.email.replace('@siluroad.xj', '@…')}</td>
                <td>{u.role !== 'owner' && <button className="btn btn-outline btn-sm">停用</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h">有效邀请链接</div>
        <div className="card-b">
          <p style={{ marginBottom: 8, fontSize: 13 }}>
            {organization.name} · 邀请码 <strong>{invite?.code}</strong>
          </p>
          <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{link}</code>
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={copy}>
              {copied ? '已复制' : '复制链接'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
