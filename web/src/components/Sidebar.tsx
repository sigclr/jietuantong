import { NavLink } from 'react-router-dom';
import { useApp } from '../mocks/store';
import { useRole } from '../hooks/useRole';
import type { Persona } from '../types';

interface NavItem {
  to: string;
  label: string;
  personas: Persona[];
  dividerBefore?: boolean;
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: '工作台', personas: ['boss', 'op', 'finance'] },
  { to: '/projects', label: '接团单', personas: ['boss', 'op', 'finance'] },
  { to: '/partners', label: '合作方', personas: ['boss', 'op', 'finance'] },
  { to: '/suppliers', label: '供应商', personas: ['boss', 'op', 'finance'] },
  { to: '/finance', label: '收支', personas: ['boss', 'op', 'finance'] },
  { to: '/team', label: '员工', personas: ['boss'], dividerBefore: true },
  { to: '/settings', label: '设置', personas: ['boss'] },
];

export function Sidebar() {
  const { organization } = useApp();
  const { persona } = useRole();

  const items = NAV.filter((item) => item.personas.includes(persona));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">接团通</div>
      <div className="sidebar-org">{organization.name}</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
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
