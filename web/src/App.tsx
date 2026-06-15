import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './mocks/store';
import { AppShell } from './layouts/AppShell';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { JoinPage } from './pages/auth/Join';
import { DashboardPage } from './pages/Dashboard';
import { PartnerListPage } from './pages/partners/PartnerList';
import { PartnerDetailPage } from './pages/partners/PartnerDetail';
import { ProjectListPage } from './pages/projects/ProjectList';
import { ProjectNewPage } from './pages/projects/ProjectNew';
import { ProjectDetailPage } from './pages/projects/ProjectDetail';
import { SupplierListPage } from './pages/suppliers/SupplierList';
import { SupplierDetailPage } from './pages/suppliers/SupplierDetail';
import { FinanceListPage } from './pages/finance/FinanceList';
import { TeamPage } from './pages/team/TeamPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ComingSoonPage } from './pages/ComingSoon';
import './styles/global.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/join/:code" element={<JoinPage />} />
          </Route>

          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/new" element={<ProjectNewPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/partners" element={<PartnerListPage />} />
            <Route path="/partners/:id" element={<PartnerDetailPage />} />
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="/finance" element={<FinanceListPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/guide"
              element={<ComingSoonPage title="导游端小程序" subtitle="导游努尔兰 · 行程确认与报账 · P3 规划" />}
            />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
