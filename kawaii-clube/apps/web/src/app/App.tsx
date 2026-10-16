import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../domain/types.ts';
import { AuthProvider, homeFor, useSession } from '../features/auth/AuthContext.tsx';
import { LoginPage } from '../features/auth/LoginPage.tsx';
import { UserLayout, AdminLayout } from '../components/Layout.tsx';
import { ToastProvider } from '../components/Toast.tsx';
import { ThemeProvider } from './ThemeContext.tsx';
import { UserHome, ProfilePage } from '../features/opportunities/UserPages.tsx';
import { OpportunitiesPage, OpportunityDetails } from '../features/opportunities/OpportunitiesPage.tsx';
import { ProposalsPage, ProposalEditor } from '../features/proposals/ProposalPages.tsx';
import { AdminDashboard, MembersPage, MemberDetails, CommunicationsPage, AutomationsPage, EventsPage, ReportsPage } from '../features/community/AdminPages.tsx';
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeFor(session)} replace />;
  return <>{children}</>;
}
function Router() {
  const { session } = useSession();
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/app" element={<RequireRole role="MEMBER"><UserLayout /></RequireRole>}>
      <Route index element={<Navigate to="inicio" replace />} /><Route path="inicio" element={<UserHome />} />
      {/* O detalhe do match abre como modal sobre a lista; o link continua direto e compartilhável. */}
      <Route path="oportunidades" element={<OpportunitiesPage />}><Route path=":matchRef" element={<OpportunityDetails />} /></Route>
      <Route path="propostas" element={<ProposalsPage />} /><Route path="propostas/:id" element={<ProposalEditor />} /><Route path="perfil" element={<ProfilePage />} />
    </Route>
    <Route path="/admin" element={<RequireRole role="ADMIN"><AdminLayout /></RequireRole>}>
      <Route index element={<AdminDashboard />} /><Route path="integrantes" element={<MembersPage />} /><Route path="integrantes/:id" element={<MemberDetails />} /><Route path="comunicacoes" element={<CommunicationsPage />} /><Route path="automacoes" element={<AutomationsPage />} /><Route path="eventos" element={<EventsPage />} /><Route path="relatorios" element={<ReportsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={session ? homeFor(session) : '/login'} replace />} />
  </Routes>;
}
export function App() {
  return <ThemeProvider><AuthProvider><ToastProvider><BrowserRouter><a className="skip" href="#conteudo">Pular para o conteúdo</a><Router /></BrowserRouter></ToastProvider></AuthProvider></ThemeProvider>;
}
