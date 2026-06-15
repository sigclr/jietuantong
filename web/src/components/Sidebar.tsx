import { NavLink } from 'react-router-dom';
import { useApp } from '../mocks/store';

const NAV = [
  { to: '/dashboard', label: '工作台' },
  { to: '/projects', label: '接团单' },
  { to: '/partners', label: '合作方' },
  { to: '/suppliers', label: '供应商' },
  { to: '/finance', label: '收支' },
  { to: '/team', label: '员工', dividerBefore: true },
  { to: '/settings', label: '设置' },
];

export function Sidebar() {
  const { organization } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">接团通</div>
      <div className="sidebar-org">{organization.name}</div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <span key={item.to}>
            {item.dividerBefore && <div className="sidebar-divider" />}
            <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          </span>
        ))}
      </nav>
    </aside>
  );
}
