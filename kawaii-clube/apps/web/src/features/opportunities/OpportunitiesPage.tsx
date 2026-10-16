import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Bookmark, FilePen, MapPin, Search, X } from 'lucide-react';
import type { Opportunity, Proposal } from '../../domain/types.ts';
import { MATCH_RULES, MODALITY_LABEL } from '../../domain/policies.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { DEMO_USER } from '../../infrastructure/fixtures.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { useNativeDialog } from '../../components/Dialog.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Empty, ErrorNote, EvidenceIcon, EvidenceList, ModalityPill, ProposalStatusTag, SkeletonCards, errorMessage } from '../../components/Shared.tsx';
const RELATION_LABEL = { PEER: 'Entre empreendedoras', COMPANY: 'Empresa e empreendedora' } as const;
export function OpportunityCard({ op, draft, saved, compact }: { op: Opportunity; draft?: Proposal; saved: boolean; compact?: boolean }) {
  const toast = useToast(); const shown = op.evidence.slice(0, 2), rest = op.evidence.slice(2);
  const pending = rest.filter(e => e.status !== 'confirmed').length;
  const toggle = async () => { const on = await demoGateway.toggleSaved(op.matchRef); toast(on ? 'Oportunidade salva' : 'Removida dos salvos'); };
  return <article className={`u-op ${compact ? 'compact' : ''}`} aria-labelledby={`op-${op.id}`}>
    <div className="u-op-head"><Link to={`/app/oportunidades/${encodeURIComponent(op.matchRef)}`} className="u-op-who"><span className={`u-op-av ${op.relation === 'COMPANY' ? 'co' : ''}`} aria-hidden="true">{op.candidate.initials}</span>
      <div><h3 className="u-op-name">{op.candidate.name}</h3><p className="u-op-biz">{op.candidate.expertise}</p></div></Link>
      <div className="u-op-right"><ModalityPill modality={op.modality} />
        <button className="save" aria-pressed={saved} aria-label={saved ? 'Remover dos salvos' : 'Salvar oportunidade'} onClick={() => void toggle()}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button></div></div>
    <p className="u-op-title" id={`op-${op.id}`}><Link to={`/app/oportunidades/${encodeURIComponent(op.matchRef)}`}>{op.title}</Link></p>
    {!compact && <p className="u-op-desc">{op.description}</p>}
    <div className="u-op-box"><p className="u-op-box-l">Por que essa oportunidade é relevante?</p>
      <ul>{shown.map(e => <li key={e.criterion}><EvidenceIcon status={e.status} /><span>{e.detail}</span></li>)}</ul>
      {rest.length > 0 && <p className="u-op-more">Mais {rest.length} no detalhe{pending ? `: ${pending} a confirmar` : ''}</p>}</div>
    <div className="u-tags"><span className="u-t">{MODALITY_LABEL[op.modality]}</span><span className="u-t muted">{RELATION_LABEL[op.relation]}</span>{draft && <ProposalStatusTag status={draft.status} />}</div>
    <div className="u-op-foot"><span className="u-loc"><MapPin size={13} /> {op.candidate.location}</span>
      <Link className="btn btn-primary btn-sm" to={draft ? `/app/propostas/${draft.id}` : `/app/oportunidades/${encodeURIComponent(op.matchRef)}`}>{draft ? 'Continuar proposta' : compact ? 'Ver match' : 'Visualizar detalhes'} <ArrowRight size={13} className="arrow" /></Link></div>
  </article>;
}
const FILTERS = [{ id: 'ALL', label: 'Todos' }, { id: 'SUPPORT', label: 'Apoio' }, { id: 'EXCHANGE', label: 'Permuta' }, { id: 'COLLAB', label: 'Collab' }, { id: 'COMPANY', label: 'Empresas' }, { id: 'SAVED', label: 'Salvas' }] as const;
type FilterId = typeof FILTERS[number]['id'];
export function OpportunitiesPage() {
  const { data, loading, error, refresh } = useDemoResource(demoGateway.listOpportunities);
  const saved = useDemoResource(demoGateway.listSaved).data ?? []; const proposals = useDemoResource(demoGateway.listProposals).data ?? [];
  const [filter, setFilter] = useState<FilterId>('ALL'); const [query, setQuery] = useState('');
  const matches = (op: Opportunity, id: FilterId) => id === 'ALL' || (id === 'SAVED' ? saved.includes(op.matchRef) : id === 'COMPANY' ? op.relation === 'COMPANY' : op.modality === id);
  const q = query.trim().toLowerCase();
  const visible = (data ?? []).filter(op => matches(op, filter) && (!q || [op.title, op.description, op.candidate.name, op.candidate.expertise, op.explanation, ...op.candidate.offered].join(' ').toLowerCase().includes(q)));
  return <><h1 className="sr">Central de oportunidades</h1>
    <section className="u-filter" aria-label="Busca e filtros">
      <div className="u-search" role="search"><Search size={14} aria-hidden="true" /><label className="sr" htmlFor="q">Buscar oportunidades</label>
        <input id="q" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome, nicho ou palavra-chave" autoComplete="off" />
        {query && <button className="clear" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={14} /></button>}</div>
      <div className="u-chips" role="group" aria-label="Filtrar">{FILTERS.map(f => <button key={f.id} className="u-fchip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}{data && <span className="n"> ({data.filter(op => matches(op, f.id)).length})</span>}</button>)}</div>
    </section>
    <div className="results" aria-live="polite">
      {loading ? <SkeletonCards count={4} /> : error ? <Empty error title="As oportunidades não carregaram" text={`${error} Nada mudou na sua conta.`}><button className="btn btn-primary" onClick={refresh}>Tentar de novo</button></Empty>
        : !data?.length ? <Empty title="Ainda não há oportunidades para você" text="Elas aparecem quando há evidências suficientes para combinar com o seu perfil e os seus posts." />
        : !visible.length ? <Empty title={q ? `Nada encontrado para “${query}”` : filter === 'SAVED' ? 'Nenhuma oportunidade salva' : 'Nenhuma oportunidade aqui'} text={filter === 'SAVED' && !q ? 'Use o marcador no canto de um card para guardar a oportunidade.' : 'Tente outro termo ou outro filtro.'}>{q && <button className="btn btn-ghost" onClick={() => setQuery('')}>Limpar busca</button>}</Empty>
        : <><div className="u-sec-head"><h2>Matches disponíveis</h2><span>{visible.length} {visible.length === 1 ? 'oportunidade demonstrativa' : 'oportunidades demonstrativas'}</span></div>
          <div className="u-cards">{visible.map(op => <OpportunityCard key={op.matchRef} op={op} saved={saved.includes(op.matchRef)} draft={proposals.find(p => p.matchRef === op.matchRef && p.authorId === DEMO_USER.id)} />)}</div></>}
    </div>
    <Outlet />
  </>;
}
/** Detalhe do match em modal central; a rota /app/oportunidades/:matchRef continua compartilhável. */
export function OpportunityDetails() {
  const { matchRef } = useParams(); const navigate = useNavigate(); const toast = useToast();
  const { data, loading } = useDemoResource(demoGateway.listOpportunities);
  const [busy, setBusy] = useState<'' | 'start' | 'dismiss'>(''); const [error, setError] = useState('');
  const close = () => navigate('/app/oportunidades');
  const dialog = useNativeDialog(true, close);
  const op = data?.find(item => item.matchRef === matchRef);
  const start = async () => {
    if (!op) return; setBusy('start'); setError('');
    try { const draft = await demoGateway.createDraft(op.matchRef, `proposal:${DEMO_USER.id}:${op.matchRef}`); navigate(`/app/propostas/${draft.id}`); }
    catch (err) { setError(errorMessage(err, 'O rascunho não foi criado.')); setBusy(''); }
  };
  const dismiss = async () => {
    if (!op) return; setBusy('dismiss');
    try { await demoGateway.dismissOpportunity(op.matchRef); toast('Oportunidade ocultada. Isso melhora as próximas recomendações.'); close(); }
    catch (err) { setError(errorMessage(err, 'Não foi possível ocultar.')); setBusy(''); }
  };
  return <dialog {...dialog} className="modal match" aria-labelledby="match-title">
    {!op ? <div className="m-body">{loading ? <p className="muted">Carregando…</p> : <Empty title="Oportunidade não encontrada" text="O link não corresponde a um match ativo da demonstração."><button className="btn btn-ghost" onClick={close}>Ver oportunidades</button></Empty>}</div> : <>
      <button className="icon-btn m-close" aria-label="Fechar" onClick={close}><X size={17} /></button>
      <div className="m-body">
        <header className="m-head"><span className={`u-op-av lg ${op.relation === 'COMPANY' ? 'co' : ''}`} aria-hidden="true">{op.candidate.initials}</span>
          <div><div className="m-head-row"><h2 className="m-name">{op.candidate.name}</h2><ModalityPill modality={op.modality} /></div><p className="u-op-biz">{op.candidate.business} · {op.candidate.location}</p></div></header>
        <section><h3 className="m-h">Necessidade identificada</h3><div className="m-box"><p id="match-title" className="m-opp">{op.title}</p><p>{op.description}</p><small>{op.explanation}</small></div></section>
        <section className="m-two"><div><h3 className="m-h">{op.relation === 'COMPANY' ? 'O que a empresa oferece' : 'O que ela oferece'}</h3><ul className="m-list">{op.candidate.offered.map(x => <li key={x}>{x}</li>)}</ul></div>
          <div><h3 className="m-h">{op.relation === 'COMPANY' ? 'O que a empresa precisa' : 'O que ela procura'}</h3><ul className="m-list">{op.candidate.needs.map(x => <li key={x}>{x}</li>)}</ul></div></section>
        <section><h3 className="m-h">Evidências de compatibilidade</h3><EvidenceList evidence={op.evidence} /></section>
        <section><h3 className="m-h">Modalidade sugerida</h3><div className="m-mod"><b>{MODALITY_LABEL[op.modality]} · {RELATION_LABEL[op.relation]}</b><ol>{MATCH_RULES[op.modality].map(x => <li key={x}>{x}</li>)}</ol></div></section>
        <p className="note">Política {op.policyVersion}. Evidência a confirmar não conta como confirmada e nenhuma nota é exibida como chance de sucesso. Antes de criar o rascunho, a oportunidade é revalidada.</p>
        {error && <ErrorNote message={error} />}
      </div>
      <footer className="m-foot"><button className="btn btn-ghost" disabled={!!busy} onClick={() => void dismiss()}>{busy === 'dismiss' ? 'Ocultando…' : 'Não tenho interesse'}</button><span className="grow" />
        <button className="btn btn-ghost" onClick={close}>Fechar</button><button className="btn btn-primary" disabled={!!busy} onClick={() => void start()}><FilePen size={15} />{busy === 'start' ? 'Criando rascunho…' : 'Criar proposta'}</button></footer>
    </>}
  </dialog>;
}
