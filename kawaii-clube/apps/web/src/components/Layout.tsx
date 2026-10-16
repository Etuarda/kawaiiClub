import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bell, ChartPie, ClipboardList, Compass, FilePen, FileText, Handshake, IdCard, LogOut, Megaphone, PenLine, RotateCcw, Search, Send, UserCog, Users, WandSparkles, BarChart3 } from 'lucide-react';
import logo from '../assets/logo-kawaii.png';
import { useSession } from '../features/auth/AuthContext.tsx';
import { ThemeButton } from '../app/ThemeContext.tsx';
import { demoGateway } from '../infrastructure/demo-gateway.ts';
import { useDemoResource } from '../app/useDemoResource.ts';
import { profileCompleteness } from '../domain/profile.ts';
import { usePending, type PendingItem } from '../features/opportunities/usePending.ts';
import { BroadcastDialog } from '../features/community/BroadcastDialog.tsx';
import { PartnershipDialog } from '../features/proposals/PartnershipDialog.tsx';
import { Avatar, DemoNotice } from './Shared.tsx';
interface NavEntry { to: string; end?: boolean; label: string; icon: ReactNode; badge?: number; gold?: boolean }
function SideNav({ links, className, compact }: { links: NavEntry[]; className: string; compact?: boolean }) {
  return <nav className={className} aria-label={compact ? 'Navegação compacta' : 'Navegação principal'}>{links.map(l =>
    <NavLink key={l.to} to={l.to} end={l.end} aria-label={compact ? l.label : undefined}>{l.icon}{!compact && <span>{l.label}</span>}{!compact && !!l.badge && <span className={`count ${l.gold ? 'gold' : ''}`}>{l.badge}</span>}</NavLink>)}</nav>;
}
function useLogout() { const { logout } = useSession(); const navigate = useNavigate(); return () => { logout(); navigate('/login'); }; }
function resetDemo() { if (window.confirm('Restaurar os dados fictícios do protótipo?')) demoGateway.resetDemo(); }
const PENDING_ICON: Record<PendingItem['icon'], ReactNode> = { pen: <PenLine size={13} />, id: <IdCard size={13} />, draft: <FilePen size={13} /> };
export function PendingIcon({ item }: { item: PendingItem }) { return <span className={`u-pop-ic ${item.tone}`} aria-hidden="true">{PENDING_ICON[item.icon]}</span>; }

/* ═══ UserLayout — sidebar bordô, header marfim ═══ */
const USER_TITLES: [string, string][] = [['/app/perfil', 'Meu perfil profissional'], ['/app/oportunidades', 'Central de oportunidades e matches'], ['/app/propostas', 'Minhas propostas e negociações'], ['/app', 'Início e jornada de parcerias']];
function NotificationBell() {
  const pending = usePending(); const navigate = useNavigate(); const [open, setOpen] = useState(false); const [partnership, setPartnership] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return <div className="u-bell-wrap" ref={wrap}>
    <button className="u-bell" aria-label={`Notificações (${pending.length})`} aria-expanded={open} onClick={() => setOpen(o => !o)}><Bell size={16} />{pending.length > 0 && <span className="u-dot" aria-hidden="true" />}</button>
    {open && <div className="u-pop" role="dialog" aria-label="Notificações">{pending.length ? pending.map(p =>
      <button key={p.key} className="u-pop-item" onClick={() => { setOpen(false); if (p.partnershipId) setPartnership(p.partnershipId); else navigate(p.href); }}><PendingIcon item={p} /><span><b>{p.title}</b><small>{p.text}</small></span></button>)
      : <p className="muted" style={{ padding: 12 }}>Nada pendente agora.</p>}</div>}
    <PartnershipDialog id={partnership} onClose={() => setPartnership(null)} />
  </div>;
}
export function UserLayout() {
  const { session } = useSession(); const logout = useLogout(); const { pathname } = useLocation();
  const opportunities = useDemoResource(demoGateway.listOpportunities), proposals = useDemoResource(demoGateway.listProposals);
  const partnerships = useDemoResource(demoGateway.listPartnerships), profile = useDemoResource(demoGateway.getProfile);
  const links: NavEntry[] = [
    { to: '/app/inicio', label: 'Início / Minha jornada', icon: <Compass size={17} /> },
    { to: '/app/perfil', label: 'Meu perfil profissional', icon: <UserCog size={17} /> },
    { to: '/app/oportunidades', label: 'Central de oportunidades', icon: <Handshake size={17} />, badge: opportunities.data?.length, gold: true },
    { to: '/app/propostas', label: 'Minhas propostas', icon: <FileText size={17} />, badge: (proposals.data?.length ?? 0) + (partnerships.data?.length ?? 0) }
  ];
  const title = USER_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? '';
  if (!session) return null;
  return <div className="u-shell">
    <aside className="u-side" aria-label="Menu da empreendedora">
      <div className="u-top">
        <NavLink to="/app/inicio" className="u-brand" aria-label="Kawaii Clube, início"><span className="u-mark"><img src={logo} alt="" /></span><span className="u-brand-t"><b>KAWAII CLUBE</b><small>Parcerias para mulheres</small></span></NavLink>
        <div className="u-user"><div className="u-user-row"><Avatar initials={session.initials} /><div><b>{session.name}</b><small>{session.business}</small></div></div>
          <div className="u-user-st"><span>Perfil completo</span><b>{profile.data ? `${profileCompleteness(profile.data)}%` : '—'}</b></div></div>
        <SideNav links={links} className="u-nav" />
      </div>
      <SideNav links={links} className="u-mnav" compact />
      <div className="u-foot"><ThemeButton className="u-theme" withLabel />
        <div className="u-links"><button onClick={resetDemo}><RotateCcw size={13} /> Reiniciar dados</button><button onClick={logout}><LogOut size={13} /> Sair</button></div></div>
    </aside>
    <div className="u-main">
      <header className="u-header"><div className="u-crumb"><NavLink to="/app/inicio" className="hdr-logo" aria-label="Kawaii Clube"><img src={logo} alt="Logo Kawaii Clube" /></NavLink><span className="overline">Painel da empreendedora</span><span className="u-sep" aria-hidden="true">/</span><p className="u-title">{title}</p></div>
        <div className="u-actions"><NotificationBell /><ThemeButton className="u-bell" /><button className="u-bell u-logout-m" onClick={logout} aria-label="Sair"><LogOut size={15} /></button>
          <NavLink to="/app/perfil" className="u-me"><div><b>{session.name}</b><small>Plano Nobreza</small></div><Avatar initials={session.initials} size="sm" /></NavLink></div></header>
      <main id="conteudo" className="u-content" tabIndex={-1}><Outlet /><DemoNotice /></main>
    </div>
  </div>;
}

/* ═══ AdminLayout — janela, sidebar escura e header com busca ═══ */
const ADMIN_TITLES: [string, string][] = [['/admin/integrantes', 'Gestão de integrantes e segmentação'], ['/admin/comunicacoes', 'Campanhas e avisos oficiais'], ['/admin/automacoes', 'Automações de WhatsApp e e-mail'], ['/admin/eventos', 'Inscrições e eventos'], ['/admin/relatorios', 'Relatórios e indicadores'], ['/admin', 'Dashboard e indicadores']];
export function AdminLayout() {
  const { session } = useSession(); const logout = useLogout(); const navigate = useNavigate(); const { pathname, search } = useLocation();
  const messages = useDemoResource(demoGateway.listMessages); const [broadcast, setBroadcast] = useState(false);
  const failed = messages.data?.filter(m => m.status === 'FAILED').length;
  const links: NavEntry[] = [
    { to: '/admin', end: true, label: 'Dashboard', icon: <ChartPie size={17} /> },
    { to: '/admin/integrantes', label: 'Gestão de membros', icon: <Users size={17} /> },
    { to: '/admin/automacoes', label: 'Automações', icon: <WandSparkles size={17} /> },
    { to: '/admin/eventos', label: 'Inscrições e eventos', icon: <ClipboardList size={17} /> },
    { to: '/admin/comunicacoes', label: 'Comunicações', icon: <Megaphone size={17} />, badge: failed, gold: true },
    { to: '/admin/relatorios', label: 'Relatórios', icon: <BarChart3 size={17} /> }
  ];
  const title = ADMIN_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? '';
  const query = pathname.startsWith('/admin/integrantes') ? new URLSearchParams(search).get('q') ?? '' : '';
  if (!session) return null;
  return <div className="adm-outer"><div className="adm-app">
    <aside className="adm-side" aria-label="Menu da equipe">
      <div className="adm-top">
        <NavLink to="/admin" className="adm-brand"><span className="adm-mark"><img src={logo} alt="Logo Kawaii Clube" /></span><div><p className="adm-name">Kawaii Admin</p><p className="adm-tag">Painel da equipe</p></div></NavLink>
        <div className="adm-user"><div className="adm-user-row"><Avatar initials={session.initials} /><div><b>{session.name}</b><small>Curadoria e operação</small></div></div>
          <div className="adm-user-st"><span>Ambiente</span><span className="online"><i aria-hidden="true" />Demonstração</span></div></div>
        <SideNav links={links} className="adm-nav" />
        <SideNav links={links} className="adm-mnav" compact />
      </div>
      <div className="adm-foot"><ThemeButton className="adm-theme" withLabel />
        <div className="adm-links"><button onClick={resetDemo}><RotateCcw size={13} /> Reiniciar dados</button><button onClick={logout}><LogOut size={13} /> Sair</button></div></div>
    </aside>
    <div className="adm-main">
      <header className="adm-header"><div className="adm-hdr-left"><NavLink to="/admin" className="hdr-logo" aria-label="Kawaii Admin"><img src={logo} alt="Logo Kawaii Clube" /></NavLink><div><p className="overline">Painel executivo · Ellen Kois</p><h1 className="adm-h">{title}</h1></div></div>
        <div className="adm-actions">
          <div className="adm-search" role="search"><Search size={15} aria-hidden="true" /><label className="sr" htmlFor="adm-q">Buscar integrantes</label>
            <input id="adm-q" type="search" placeholder="Buscar integrantes, áreas…" defaultValue={query} key={pathname}
              onChange={e => { if (pathname.startsWith('/admin/integrantes')) navigate({ search: e.target.value ? `?q=${encodeURIComponent(e.target.value)}` : '' }, { replace: true }); }}
              onKeyDown={e => { if (e.key === 'Enter' && !pathname.startsWith('/admin/integrantes')) navigate(`/admin/integrantes?q=${encodeURIComponent(e.currentTarget.value)}`); }} /></div>
          <ThemeButton className="icon-btn adm-theme-m" /><button className="icon-btn adm-theme-m" onClick={logout} aria-label="Sair"><LogOut size={16} /></button>
          <button className="btn btn-primary adm-cta" onClick={() => setBroadcast(true)}><Send size={15} /><span>Novo disparo</span></button>
        </div></header>
      <main id="conteudo" className="adm-content" tabIndex={-1}><Outlet /><DemoNotice /></main>
    </div>
    <BroadcastDialog open={broadcast} onClose={() => setBroadcast(false)} />
  </div></div>;
}
