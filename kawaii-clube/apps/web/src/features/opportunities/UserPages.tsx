import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChartPie, ChevronLeft, ChevronRight, FilePen, FileText, MapPin, Pause, Play, Save, Sparkles, Target } from 'lucide-react';
import type { Modality, Opportunity, ProfessionalProfile, Proposal, Relation } from '../../domain/types.ts';
import { profileCompleteness } from '../../domain/profile.ts';
import { JOURNEY_STEPS } from '../../domain/journey.ts';
import { MODALITY_LABEL } from '../../domain/policies.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { DEMO_USER } from '../../infrastructure/fixtures.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { useSession } from '../auth/AuthContext.tsx';
import { PendingIcon } from '../../components/Layout.tsx';
import { Avatar, Empty, ProposalStatusTag, SkeletonCards, errorMessage, shortDate } from '../../components/Shared.tsx';
import { useToast } from '../../components/Toast.tsx';
import { PartnershipDialog } from '../proposals/PartnershipDialog.tsx';
import { OpportunityCard } from './OpportunitiesPage.tsx';
import { usePending } from './usePending.ts';
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
function Stat({ label, value, tag, tone, icon }: { label: string; value: ReactNode; tag: string; tone: 'warn' | 'brand' | 'gold'; icon: ReactNode }) {
  return <article className="u-stat"><div><p className="u-stat-l">{label}</p><p className="u-stat-n">{value}</p><span className={`u-tag ${tone}`}>{tag}</span></div><span className="u-stat-ic" aria-hidden="true">{icon}</span></article>;
}
function RollingOpportunities({ ops, saved, drafts }: { ops: Opportunity[]; saved: string[]; drafts: Proposal[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const isPaused = paused || manualPause;
  useEffect(() => {
    const el = trackRef.current;
    if (!el || ops.length === 0) return;
    let raf = 0;
    const tick = () => {
      if (!isPaused && el.scrollWidth > el.clientWidth) {
        posRef.current += 0.55;
        const half = el.scrollWidth / 2;
        if (posRef.current >= half) posRef.current -= half;
        el.scrollLeft = posRef.current;
      } else {
        posRef.current = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, ops.length]);
  const step = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const next = el.scrollLeft + dir * 360;
    el.scrollTo({ left: next, behavior: 'smooth' });
    posRef.current = Math.max(0, next);
  };
  const doubled = [...ops, ...ops];
  return <div className="u-roller-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
    <div className="u-roller-bar">
      <span className="u-roller-hint">Rolagem contínua ativa · passe o cursor para pausar</span>
      <div className="u-roller-ctrls">
        <button type="button" className="icon-btn sm" aria-label={manualPause ? 'Retomar rolagem automática' : 'Pausar rolagem automática'} onClick={() => setManualPause(p => !p)}>
          {manualPause ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button type="button" className="icon-btn sm" aria-label="Anterior" onClick={() => step(-1)}><ChevronLeft size={16} /></button>
        <button type="button" className="icon-btn sm" aria-label="Próxima" onClick={() => step(1)}><ChevronRight size={16} /></button>
      </div>
    </div>
    <div className="u-roller-viewport" ref={trackRef}>
      <div className="u-roller-track">
        {doubled.map((op, idx) => (
          <div className="u-roller-slide" key={`${op.matchRef}-${idx}`} aria-hidden={idx >= ops.length ? 'true' : undefined}>
            <OpportunityCard op={op} compact saved={saved.includes(op.matchRef)} draft={drafts.find(d => d.matchRef === op.matchRef)} />
          </div>
        ))}
      </div>
    </div>
  </div>;
}
export function UserHome() {
  const { session } = useSession(); const pending = usePending(); const [partnership, setPartnership] = useState<string | null>(null);
  const opportunities = useDemoResource(demoGateway.listOpportunities), proposals = useDemoResource(demoGateway.listProposals);
  const partnerships = useDemoResource(demoGateway.listPartnerships), profile = useDemoResource(demoGateway.getProfile);
  const saved = useDemoResource(demoGateway.listSaved).data ?? [], members = useDemoResource(demoGateway.listMembers);
  const ops = opportunities.data ?? [], drafts = proposals.data ?? [], deals = partnerships.data ?? [];
  const nDraft = drafts.filter(d => d.status === 'DRAFT').length, nReady = drafts.length - nDraft;
  const pendingEvidence = ops.filter(o => o.evidence.some(e => e.status !== 'confirmed')).length;
  const stageAt = JOURNEY_STEPS.findIndex(s => s.id === (members.data?.find(m => m.id === DEMO_USER.id)?.stage ?? 'joined'));
  const stage = JOURNEY_STEPS[stageAt];
  return <><h1 className="sr">Início</h1>
    <section className="u-welcome"><div className="u-glow" aria-hidden="true" /><div className="u-welcome-in kw-rise">
      <span className="u-chip-gold">Jornada ativa · {stage.label}</span>
      <h2 className="u-welcome-h">{greeting()}, {session?.name.split(' ')[0]}. Vamos transformar oportunidades em parcerias.</h2>
      <p className="u-welcome-p">{opportunities.loading ? 'Carregando o seu momento…' : opportunities.error ? 'As recomendações não carregaram agora. O restante do painel continua disponível.'
        : <>Você tem <strong>{plural(ops.length, 'oportunidade', 'oportunidades')}</strong> com evidências de que a parceria faz sentido para o seu negócio{nDraft ? <> e <strong>{plural(nDraft, 'rascunho', 'rascunhos')}</strong> para continuar</> : ''}.</>}</p>
      <div className="u-welcome-act"><Link className="btn btn-light" to="/app/oportunidades"><Sparkles size={15} /> Explorar oportunidades ({ops.length})</Link><Link className="btn btn-outline-lt" to="/app/propostas"><FileText size={15} /> Ver propostas ({drafts.length + deals.length})</Link></div></div></section>
    <section className="u-stats" aria-label="Seu momento">
      <Stat label="Oportunidades" value={opportunities.loading ? '—' : ops.length} tag={pendingEvidence ? `${pendingEvidence} com item a confirmar` : 'evidências conferidas'} tone={pendingEvidence ? 'warn' : 'brand'} icon={<Target size={20} />} />
      <Stat label="Rascunhos" value={nDraft} tag={nDraft ? 'continue de onde parou' : 'nenhum em andamento'} tone="warn" icon={<FilePen size={20} />} />
      <Stat label="Propostas ativas" value={deals.length + nReady} tag={`${deals.filter(p => p.status === 'NEGOTIATING').length} em negociação`} tone="warn" icon={<FileText size={20} />} />
      <Stat label="Perfil completo" value={profile.data ? `${profileCompleteness(profile.data)}%` : '—'} tag="melhora as recomendações" tone="gold" icon={<ChartPie size={20} />} />
    </section>
    <section className="u-carousel-sec" aria-labelledby="rec-h">
      <div className="u-sec-head">
        <div>
          <p className="overline">Curadoria algorítmica</p>
          <h2 id="rec-h">Oportunidades recomendadas para você</h2>
        </div>
        <Link className="btn-link" to="/app/oportunidades">Ver todas ({ops.length}) <ArrowRight size={13} /></Link>
      </div>
      {opportunities.loading ? <SkeletonCards /> : !ops.length ? <Empty title="Ainda sem recomendações" text="Complete o perfil e publique o que você oferece e o que precisa."><Link className="btn btn-primary" to="/app/perfil">Completar perfil</Link></Empty>
        : <RollingOpportunities ops={ops} saved={saved} drafts={drafts} />}
    </section>
    <div className="u-home-grid">
      <section className="u-card" aria-labelledby="neg-h">
        <div className="u-sec-head" style={{ marginTop: 0 }}>
          <h2 id="neg-h" className="u-card-h" style={{ marginBottom: 0 }}>Jornadas de parcerias e negociações</h2>
          <Link className="btn-link" to="/app/propostas">Abrir propostas <ArrowRight size={13} /></Link>
        </div>
        <div className="u-todo" style={{ marginTop: 14 }}>
          {deals.map(p => (
            <div className="u-todo-item" key={p.id}>
              <Avatar initials={p.partner.initials} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="button" className="btn-link" style={{ margin: 0, fontSize: 13.5 }} onClick={() => setPartnership(p.id)}>{p.partner.name} · {p.partner.business}</button>
                  <ProposalStatusTag status={p.status} />
                </div>
                <small>{p.objective}</small>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span className="muted small">{MODALITY_LABEL[p.modality]} · {shortDate(p.date)}</span>
                  <button type="button" className="btn-link" onClick={() => setPartnership(p.id)}>Ver histórico <ArrowRight size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="u-home-side">
        <section className="u-card" aria-labelledby="todo-h"><h3 id="todo-h" className="u-card-h">Ações pendentes</h3><div className="u-todo">{pending.length ? pending.map(p =>
          <div className="u-todo-item" key={p.key}><PendingIcon item={p} /><div><b>{p.title}</b><small>{p.text}</small>
            {p.partnershipId ? <button className="btn-link" onClick={() => setPartnership(p.partnershipId!)}>{p.cta} <ArrowRight size={12} /></button> : <Link className="btn-link" to={p.href}>{p.cta} <ArrowRight size={12} /></Link>}</div></div>) : <p className="muted">Tudo em dia.</p>}</div></section>
        <section className="u-deep" aria-labelledby="jr-h"><p className="u-deep-over">Sua etapa no Clube</p><h3 id="jr-h" className="u-deep-h">{stage.label}</h3>
          <ol className="u-steps">{JOURNEY_STEPS.map((s, i) => <li key={s.id} className={i < stageAt ? 'done' : i === stageAt ? 'now' : ''} aria-current={i === stageAt ? 'step' : undefined}>{i < stageAt ? <Check size={12} /> : <i />}{s.label}</li>)}</ol>
          <p className="u-deep-note">A Kawaii acompanha cada etapa por WhatsApp e e-mail, nos canais que você autorizou.</p></section>
      </aside>
    </div>
    <PartnershipDialog id={partnership} onClose={() => setPartnership(null)} />
  </>;
}
const MODALITY_OPTIONS: [Modality, string][] = [['EXCHANGE', 'Permuta de serviços'], ['COLLAB', 'Collab de produtos'], ['SUPPORT', 'Apoio e mentoria']];
const AVAILABILITY = ['Alta, de 10 a 15 horas por semana', 'Moderada, de 5 a 10 horas por semana', 'Pontual, só projetos específicos'];
type SaveState = 'saved' | 'dirty' | 'busy' | 'err';
const SAVE_LABEL: Record<SaveState, string> = { saved: 'Tudo salvo', dirty: 'Alterações não salvas', busy: 'Salvando…', err: 'Não salvo' };
export function ProfilePage() {
  const { session } = useSession(); const toast = useToast(); const stored = useDemoResource(demoGateway.getProfile);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null); const [state, setState] = useState<SaveState>('saved');
  useEffect(() => { if (stored.data && !profile) setProfile(stored.data); }, [stored.data, profile]);
  if (!profile || !session) return stored.error ? <Empty error title="O perfil não carregou" text={stored.error} /> : <SkeletonCards count={1} />;
  const change = <K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) => { setProfile(p => p && { ...p, [key]: value }); setState('dirty'); };
  const toggleIn = <T,>(list: T[], v: T, on: boolean) => on ? [...list, v] : list.filter(x => x !== v);
  const save = async () => {
    setState('busy'); const hadInvoice = !!stored.data?.invoice.trim();
    try { const res = await demoGateway.saveProfile(profile); setState('saved'); toast(!hadInvoice && res.invoice.trim() ? 'Perfil salvo. Empresas que exigem nota fiscal já podem considerar você.' : 'Alterações salvas no perfil'); }
    catch (err) { setState('err'); toast(errorMessage(err, 'Não foi possível salvar o perfil.')); }
  };
  const pct = profileCompleteness(profile);
  const text = (id: keyof ProfessionalProfile, label: string, area = false, extra?: ReactNode) => <div className="field"><label htmlFor={`p-${id}`}>{label}</label>
    {area ? <textarea id={`p-${id}`} rows={3} value={String(profile[id])} onChange={e => change(id, e.target.value as never)} /> : <input id={`p-${id}`} value={String(profile[id])} onChange={e => change(id, e.target.value as never)} />}{extra}</div>;
  return <><h1 className="sr">Meu perfil profissional</h1>
    <form className="u-card u-profile" noValidate onSubmit={e => { e.preventDefault(); void save(); }}>
      <div className="u-prof-head"><div className="u-prof-who"><span className="u-prof-av" aria-hidden="true">{session.initials}</span><div><h2 className="u-prof-name">{session.name}</h2><p className="u-prof-role">Fundadora · {session.business}</p><p className="u-prof-loc"><MapPin size={13} /> Itaquera, SP · Zona Leste</p>
        <div className="u-meter" aria-label={`Perfil ${pct}% completo`}><div className="u-meter-bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></div><span><b>{pct}%</b> completo</span></div></div></div>
        <div className="u-prof-save"><span className={`savestate ${state}`} role="status" aria-live="polite"><i aria-hidden="true" /><span>{SAVE_LABEL[state]}</span></span><button className="btn btn-primary" type="submit" disabled={state === 'busy'}><Save size={15} /> Salvar alterações</button></div></div>
      <div className="u-grid2">{text('offers', 'Serviços oferecidos', true)}{text('needs', 'Necessidades atuais', true)}{text('goals', 'Objetivos de parceria')}{text('audience', 'Público-alvo')}</div>
      <div className="u-grid2 u-sep-top">
        <fieldset className="plain"><legend className="u-lbl">Modalidades de interesse</legend><div className="u-checks">
          {MODALITY_OPTIONS.map(([k, l]) => <label key={k} className="u-check"><input type="checkbox" checked={profile.modalities.includes(k)} onChange={e => change('modalities', toggleIn(profile.modalities, k, e.target.checked))} /> {l}</label>)}
          <label className="u-check"><input type="checkbox" checked={profile.relations.includes('COMPANY')} onChange={e => change('relations', toggleIn<Relation>(profile.relations, 'COMPANY', e.target.checked))} /> Oportunidades de empresas</label></div>
          <p className="hint">Empresa é um tipo de relação, não uma modalidade: o match continua usando a política de cada modalidade.</p></fieldset>
        <div className="field"><label htmlFor="p-availability">Disponibilidade de dedicação</label><select id="p-availability" className="select" value={profile.availability} onChange={e => change('availability', e.target.value)}>{AVAILABILITY.map(o => <option key={o}>{o}</option>)}</select>
          <p className="hint">Usada para não recomendar parcerias que pedem mais tempo do que você tem.</p></div>
      </div>
      <div className="u-grid2 u-sep-top">
        <div>{text('area', 'Área de atuação')}{text('invoice', 'Emissão de nota fiscal (opcional)', false, <p className="hint">Ex.: MEI ativo. Empresas costumam exigir este dado.</p>)}</div>
        <fieldset className="plain"><legend className="u-lbl">Como a Kawaii fala com você</legend>
          <label className="switch"><input type="checkbox" checked={profile.whatsapp} onChange={e => change('whatsapp', e.target.checked)} /><span className="track" aria-hidden="true" /><span><b>WhatsApp</b><small>Lembretes, convites e alerta de oportunidade.</small></span></label>
          <label className="switch"><input type="checkbox" checked={profile.email} onChange={e => change('email', e.target.checked)} /><span className="track" aria-hidden="true" /><span><b>E-mail</b><small>Conteúdo completo, agenda e resumos.</small></span></label>
          <p className="hint">Preferência local da demonstração: não altera as permissões do painel da equipe nem dispara mensagens.</p></fieldset>
      </div>
    </form></>;
}
