import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../mocks/store';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ProtoNav } from '../components/ProtoNav';

export function AppShell() {
  const { isLoggedIn } = useApp();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-root">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <div className="content-wrap">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </div>
      <ProtoNav />
    </div>
  );
}
