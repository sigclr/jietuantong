import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGES = [
  { path: '/login', label: '1. 登录' },
  { path: '/register', label: '2. 注册' },
  { path: '/join/8FK2-9D3A', label: '3. 邀请加入' },
  { path: '/dashboard', label: '4. 工作台（马总）' },
  { path: '/projects', label: '5. 接团单（阿财）' },
  { path: '/projects/new', label: '6. 新建接团' },
  { path: '/projects/JTT-20260615-01', label: '7. 团详情' },
  { path: '/partners', label: '8. 合作方' },
  { path: '/partners/p1', label: '9. 合作方详情' },
  { path: '/suppliers', label: '10. 供应商' },
  { path: '/suppliers/s1', label: '11. 供应商详情' },
  { path: '/finance', label: '12. 财务（王姐）' },
  { path: '/team', label: '13. 员工' },
  { path: '/settings', label: '14. 设置' },
  { path: '/guide', label: '15. 导游端 P3', disabled: true },
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
            <button
              key={p.path}
              type="button"
              className={p.disabled ? 'disabled' : ''}
              onClick={() => !p.disabled && navigate(p.path)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
