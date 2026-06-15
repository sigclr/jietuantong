import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGES = [
  { path: '/login', label: '1. 登录' },
  { path: '/register', label: '2. 注册' },
  { path: '/join/8FK2-9D3A', label: '3. 邀请加入' },
  { path: '/dashboard', label: '4. 工作台' },
  { path: '/partners', label: '5. 合作方' },
  { path: '/partners/p1', label: '6. 合作方详情' },
  { path: '/suppliers', label: '7. 供应商' },
  { path: '/projects', label: '8. 接团单' },
  { path: '/projects/new', label: '9. 新建接团' },
  { path: '/projects/JTT-20260615-01', label: '10. 团详情' },
  { path: '/finance', label: '11. 全局收支' },
  { path: '/team', label: '12. 员工' },
  { path: '/settings', label: '13. 设置' },
];

export function ProtoNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="proto-nav">
      <button type="button" className="proto-nav-toggle" onClick={() => setOpen(!open)}>
        {open ? '▾ 原型导航' : '◂ 原型导航'}
      </button>
      {open && (
        <div className="proto-nav-list">
          {PAGES.map((p) => (
            <button key={p.path} type="button" onClick={() => navigate(p.path)}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
