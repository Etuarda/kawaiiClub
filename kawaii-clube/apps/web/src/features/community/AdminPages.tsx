import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Plus, QrCode, Send, UserPlus } from 'lucide-react';
import type { Channel, ClubEvent, ClubMember, Communication } from '../../domain/types.ts';
import { JOURNEY_LABEL } from '../../domain/policies.ts';
import { JOURNEY_STEPS, engagementLevel, initialsOf } from '../../domain/journey.ts';
import { SEGMENTS } from '../../domain/campaign.ts';
import { remainingSeats } from '../../domain/event.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { Dialog } from '../../components/Dialog.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Avatar, CampaignStatusTag, Empty, ErrorNote, Loading, MessageStatusTag, Status, errorMessage } from '../../components/Shared.tsx';
import { BroadcastDialog } from './BroadcastDialog.tsx';
const fmtDate = (s: string) => new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const channelName = (c: Channel) => c === 'WHATSAPP' ? 'WhatsApp' : 'E-mail';
const ChannelIcon = ({ c }: { c: Channel }) => c === 'WHATSAPP' ? <MessageCircle size={14} aria-hidden="true" /> : <Mail size={14} aria-hidden="true" />;
function Consent({ m }: { m: ClubMember }) {
  return <span className="consent"><span className={`ch ${m.whatsappConsent ? '' : 'off'}`} title={`${m.whatsappConsent ? 'Autorizou' : 'Não autorizou'} WhatsApp`}>WhatsApp</span><span className={`ch ${m.emailConsent ? '' : 'off'}`} title={`${m.emailConsent ? 'Autorizou' : 'Não autorizou'} e-mail`}>E-mail</span></span>;
}
function Engagement({ score }: { score: number }) { const e = engagementLevel(score); return <Status tone={e.tone}>{e.label}</Status>; }

/* ── Dashboard ── */
export function AdminDashboard() {
  const members = useDemoResource(demoGateway.listMembers), messages = useDemoResource(demoGateway.listMessages), proposals = useDemoResource(demoGateway.listProposals);
  const [grown, setGrown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setGrown(true)); return () => cancelAnimationFrame(id); }, []);
  if (members.loading || messages.loading) return <Loading />;
  const ms = members.data ?? [], msgs = messages.data ?? [];
  const active = ms.filter(m => m.engagementScore >= 40).length;
  const byStage = JOURNEY_STEPS.map(s => ({ ...s, n: ms.filter(m => m.stage === s.id).length })); const max = Math.max(...byStage.map(s => s.n), 1);
  const failed = msgs.filter(m => m.status === 'FAILED').length, scheduled = msgs.filter(m => m.status === 'SCHEDULED').length;
  return <>
    <section className="adm-metrics" aria-label="Indicadores da amostra">
      <article className="mcard"><div className="mcard-top"><span>Integrantes ativas</span><Status tone="ok">{Math.round(active / Math.max(ms.length, 1) * 100)}%</Status></div><p className="mcard-n">{active}</p><div className="mcard-foot"><span>de {ms.length} na amostra fictícia</span><b>30 dias</b></div></article>
      <article className="mcard"><div className="mcard-top"><span>Fila de mensagens</span>{failed > 0 && <Status tone="err">{failed} {failed === 1 ? 'falha' : 'falhas'}</Status>}</div><p className="mcard-n">{scheduled}</p><div className="mcard-foot"><span>agendadas para processar</span><Link className="btn-link" to="/admin/comunicacoes">Ver fila</Link></div></article>
      <article className="mcard deep"><div className="mcard-top"><span>Jornada automática</span><span className="pill-lt">{JOURNEY_STEPS.length} etapas</span></div><h2 className="mcard-h">Ativação da comunidade</h2><p>Boas-vindas, perfil, convite para evento e primeira conexão, por WhatsApp e e-mail.</p><Link className="btn btn-light" to="/admin/automacoes">Configurar automações</Link></article>
    </section>
    <div className="adm-grid">
      <section className="acard span2" aria-labelledby="st-h"><div className="acard-head"><div><h2 id="st-h" className="acard-h">Integrantes por etapa da jornada</h2><p className="muted">Onde cada integrante da amostra está agora</p></div><span className="chip-lt">Dados fictícios</span></div>
        <div className="bars" role="img" aria-label={`Integrantes por etapa: ${byStage.map(s => `${s.label} ${s.n}`).join(', ')}`}>{byStage.map(s =>
          <div className="bar-col" key={s.id}><div className={`bar ${grown ? 'grown' : ''} ${s.n === max ? 'peak' : ''}`} style={{ ['--h' as string]: s.n / max }} data-v={`${s.n}`} /><span>{s.label}</span></div>)}</div>
        <div className="acard-foot"><span>{proposals.data?.length ?? 0} {proposals.data?.length === 1 ? 'rascunho de proposta criado' : 'rascunhos de proposta criados'} na demonstração</span><Link className="btn-link" to="/admin/integrantes">Ver integrantes</Link></div></section>
      <section className="acard" aria-labelledby="ra-h"><div className="acard-head"><h2 id="ra-h" className="acard-h sm">Comunicações recentes</h2><Link className="btn-link" to="/admin/comunicacoes">Ver todas</Link></div>
        <ul className="recent">{msgs.slice(0, 4).map(msg => { const m = ms.find(x => x.id === msg.memberId); return <li key={msg.id}><Avatar initials={m ? initialsOf(m.name) : '?'} /><div><Link className="name-link" to={`/admin/integrantes/${msg.memberId}`}><b>{m?.name ?? msg.memberId}</b></Link><small>{channelName(msg.channel)} · {msg.template}</small></div><MessageStatusTag status={msg.status} /></li>; })}</ul></section>
    </div></>;
}

/* ── Gestão de membros ── */
export function MembersPage() {
  const { data, loading } = useDemoResource(demoGateway.listMembers); const [params] = useSearchParams(); const query = (params.get('q') ?? '').toLowerCase();
  const [stage, setStage] = useState('all'); const [adding, setAdding] = useState(false);
  const list = (data ?? []).filter(m => (stage === 'all' || m.stage === stage) && `${m.name} ${m.area}`.toLowerCase().includes(query));
  return <section className="acard"><div className="acard-head wrap"><div><h2 className="acard-h">Gestão de integrantes e segmentação</h2><p className="muted">Etapa da jornada, engajamento e consentimento por canal.</p></div>
    <button className="btn btn-primary" onClick={() => setAdding(true)}><UserPlus size={16} /> Adicionar integrante</button></div>
    <div className="chips" role="group" aria-label="Filtrar por etapa">{[['all', 'Todas'] as const, ...JOURNEY_STEPS.map(s => [s.id, s.label] as const)].map(([id, l]) =>
      <button key={id} className="chip" aria-pressed={stage === id} onClick={() => setStage(id)}>{l}{id !== 'all' && <span className="muted"> {data?.filter(m => m.stage === id).length ?? 0}</span>}</button>)}</div>
    {loading ? <Loading /> : !list.length ? <Empty title="Nenhuma integrante encontrada" text={query ? `Nada para “${params.get('q')}”. Altere a busca no topo ou o filtro.` : 'Altere o filtro para encontrar participantes.'} />
      : <div className="table-wrap flat"><table><caption className="sr">Integrantes</caption><thead><tr><th scope="col">Integrante</th><th scope="col">Etapa</th><th scope="col">Consentimento</th><th scope="col">Engajamento (30 dias)</th><th scope="col">Última atividade</th><th scope="col" className="r">Ação</th></tr></thead>
        <tbody>{list.map(m => <tr key={m.id}><td><div className="cell-who"><Avatar initials={initialsOf(m.name)} /><div><Link className="name-link" to={`/admin/integrantes/${m.id}`}><b>{m.name}</b></Link><small>{m.area}</small></div></div></td><td>{JOURNEY_LABEL[m.stage]}</td><td><Consent m={m} /></td>
          <td><Engagement score={m.engagementScore} /> <span className="muted small">{m.engagementScore} pts</span></td><td className="muted nowrap">{m.lastActivity}</td><td className="r"><Link className="btn btn-ghost btn-sm" to={`/admin/integrantes/${m.id}`}>Gerenciar</Link></td></tr>)}</tbody></table></div>}
    <p className="note" style={{ marginTop: 12 }}>{list.length} {list.length === 1 ? 'integrante' : 'integrantes'}. Pontuação ilustrativa: check-in, parceria, chat, post e acesso ao App.</p>
    <AddMemberDialog open={adding} onClose={() => setAdding(false)} />
  </section>;
}
function AddMemberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const [form, setForm] = useState({ name: '', area: '', whatsappConsent: false, emailConsent: false }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const close = () => { setError(''); onClose(); };
  const submit = async () => {
    setBusy(true); setError('');
    try { const m = await demoGateway.addMember(form); toast(`${m.name.split(' ')[0]} adicionada na etapa Cadastro.`); setForm({ name: '', area: '', whatsappConsent: false, emailConsent: false }); close(); }
    catch (err) { setError(errorMessage(err, 'Não foi possível adicionar.')); } finally { setBusy(false); }
  };
  return <Dialog open={open} onClose={close} overline="Nova integrante" title="Adicionar integrante" onSubmit={() => void submit()}
    footer={<><button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Adicionando…' : 'Adicionar'}</button></>}>
    <div className="cols"><div className="field"><label htmlFor="nm">Nome</label><input id="nm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div className="field"><label htmlFor="na">Área de atuação</label><input id="na" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} /></div></div>
    <fieldset className="consent-box"><legend>Consentimento registrado</legend>
      <label className="check-line"><input type="checkbox" checked={form.whatsappConsent} onChange={e => setForm(f => ({ ...f, whatsappConsent: e.target.checked }))} /> WhatsApp</label>
      <label className="check-line"><input type="checkbox" checked={form.emailConsent} onChange={e => setForm(f => ({ ...f, emailConsent: e.target.checked }))} /> E-mail</label>
      <p className="note">Marque só o que a integrante autorizou. Sem consentimento, a jornada automática não envia mensagens.</p></fieldset>
    {error && <ErrorNote message={error} />}
  </Dialog>;
}
export function MemberDetails() {
  const { id } = useParams(); const toast = useToast();
  const members = useDemoResource(demoGateway.listMembers), messages = useDemoResource(demoGateway.listMessages);
  const member = members.data?.find(m => m.id === Number(id)); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const schedule = async () => {
    if (!member) return; setBusy(true); setError('');
    try { const msg = await demoGateway.scheduleMessage(member.id, JOURNEY_LABEL[member.stage]); toast(`Lembrete agendado por ${channelName(msg.channel)}. Nenhum contato real será feito.`); }
    catch (e) { setError(errorMessage(e, 'Falha ao agendar.')); } finally { setBusy(false); }
  };
  if (members.loading || messages.loading) return <Loading />;
  if (!member) return <Empty title="Integrante não encontrada" text="Selecione uma integrante cadastrada na amostra."><Link className="btn btn-ghost" to="/admin/integrantes">Voltar</Link></Empty>;
  const history = (messages.data ?? []).filter(m => m.memberId === member.id);
  return <><Link className="crumb" to="/admin/integrantes"><ArrowLeft size={15} className="arrow" /> Integrantes</Link>
    <div className="adm-grid">
      <section className="acard span2"><div className="acard-head bordered"><div className="cell-who"><Avatar initials={initialsOf(member.name)} size="lg" /><div><h2 className="acard-h">{member.name}</h2><small>{member.area}</small></div></div><Engagement score={member.engagementScore} /></div>
        <div className="am-grid"><div><span className="lbl">Etapa da jornada</span><p>{JOURNEY_LABEL[member.stage]}</p></div><div><span className="lbl">Engajamento</span><p>{member.engagementScore} pontos ilustrativos</p></div>
          <div><span className="lbl">Última atividade</span><p>{member.lastActivity}</p></div><div><span className="lbl">Consentimento</span><p><Consent m={member} /></p></div>
          <div><span className="lbl">Telefone</span><p>{member.phoneMasked}</p></div><div><span className="lbl">E-mail</span><p>{member.emailMasked}</p></div></div>
        <h3 className="m-h" style={{ marginTop: 18 }}>Histórico de comunicações</h3>
        {history.length ? <ul className="recent">{history.map(m => <li key={m.id}><span className="u-pop-ic brand" aria-hidden="true"><ChannelIcon c={m.channel} /></span><div><b>{m.template}</b><small>{channelName(m.channel)} · {fmtDate(m.updatedAt)}</small></div><MessageStatusTag status={m.status} /></li>)}</ul> : <p className="muted">Sem comunicações no cenário de teste.</p>}</section>
      <aside className="acard"><h2 className="acard-h sm">Lembrete da etapa</h2><p className="muted" style={{ margin: '8px 0 16px' }}>O lembrete de “{JOURNEY_LABEL[member.stage]}” respeita consentimento, limite de 2 mensagens por semana e duplicidade.</p>
        {error && <ErrorNote message={error} />}<button className="btn btn-primary full" disabled={busy} onClick={() => void schedule()}><Send size={15} />{busy ? 'Agendando…' : 'Agendar lembrete'}</button></aside>
    </div></>;
}

/* ── Comunicações ── */
const TEMPLATES = ['Convite para evento', 'Boas-vindas', 'Completar perfil', 'Nova oportunidade', 'Acompanhamento de proposta'];
export function CommunicationsPage() {
  const messages = useDemoResource(demoGateway.listMessages), members = useDemoResource(demoGateway.listMembers), campaigns = useDemoResource(demoGateway.listCampaigns);
  const toast = useToast(); const [broadcast, setBroadcast] = useState(false); const [composing, setComposing] = useState(false); const [simulateFailure, setSimulateFailure] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const perform = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true); setError('');
    try { await action(); toast(success); } catch (e) { setError(errorMessage(e, 'Operação falhou.')); } finally { setBusy(false); }
  };
  const msgs = messages.data ?? [];
  const counts = useMemo(() => { const c: Partial<Record<Communication['status'], number>> = {}; msgs.forEach(m => { c[m.status] = (c[m.status] ?? 0) + 1; }); return c; }, [msgs]);
  return <>
    <section className="acard"><div className="acard-head wrap bordered"><div><p className="overline brand">Avisos para segmentos</p><h2 className="acard-h">Campanhas e avisos oficiais</h2></div><button className="btn btn-primary" onClick={() => setBroadcast(true)}><Send size={15} /> Novo comunicado</button></div>
      {campaigns.loading ? <Loading /> : <div className="ev-rows">{(campaigns.data ?? []).map(c => <article className="ev-row" key={c.id}>
        <div><span className="pill-tag">{SEGMENTS[c.segment].label}</span><h3 className="ev-title">{c.title}</h3><p className="muted">{channelName(c.channel)} · {c.audience} com consentimento{c.excluded ? ` · ${c.excluded} sem consentimento ficaram de fora` : ''}</p></div>
        <div className="row-actions"><CampaignStatusTag status={c.status} />{c.status === 'SCHEDULED' && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void perform(() => demoGateway.processCampaign(c.id, simulateFailure), 'Disparo processado no simulador.')}>Processar</button>}</div></article>)}</div>}
    </section>
    <section className="acard spaced"><div className="acard-head wrap"><div><h2 className="acard-h sm">Fila de mensagens individuais</h2><p className="muted">Mensagens da jornada, com o status confirmado pelo provedor simulado.</p></div>
      <div className="row-actions"><label className="check-line"><input type="checkbox" checked={simulateFailure} onChange={e => setSimulateFailure(e.target.checked)} /> Simular falha do provedor</label><button className="btn btn-ghost btn-sm" onClick={() => setComposing(true)}><Plus size={14} /> Nova mensagem</button></div></div>
      <div className="tally" aria-label="Resumo" style={{ marginBottom: 14 }}>{(['SCHEDULED', 'SENT', 'DELIVERED', 'FAILED'] as const).map(s => <span key={s}><MessageStatusTag status={s} /> {counts[s] ?? 0}</span>)}</div>
      {error && <ErrorNote message={error} />}
      {messages.loading ? <Loading /> : <div className="table-wrap flat"><table><caption className="sr">Comunicações por WhatsApp e e-mail</caption><thead><tr><th scope="col">Integrante</th><th scope="col">Mensagem</th><th scope="col">Canal</th><th scope="col">Status</th><th scope="col">Atualização</th><th scope="col" className="r">Ação</th></tr></thead>
        <tbody>{msgs.map(m => <tr key={m.id}><td className="nowrap"><Link className="name-link" to={`/admin/integrantes/${m.memberId}`}><b>{members.data?.find(x => x.id === m.memberId)?.name ?? m.memberId}</b></Link></td><td>{m.template}{m.error && <small className="error-small">{m.error}</small>}</td><td className="nowrap"><span className="inline-ic"><ChannelIcon c={m.channel} /> {channelName(m.channel)}</span></td><td><MessageStatusTag status={m.status} /></td><td className="muted nowrap">{fmtDate(m.updatedAt)}</td>
          <td className="r"><div className="table-actions">{m.status === 'SCHEDULED' && <><button className="btn-link" disabled={busy} onClick={() => void perform(() => demoGateway.processMessage(m.id, simulateFailure), 'Processamento simulado concluído.')}>Processar</button><button className="btn-link" disabled={busy} onClick={() => void perform(() => demoGateway.cancelMessage(m.id), 'Agendamento cancelado.')}>Cancelar</button></>}
            {m.status === 'FAILED' && <button className="btn-link" disabled={busy} onClick={() => void perform(() => demoGateway.retryMessage(m.id), 'Retentativa agendada.')}>Reagendar</button>}</div></td></tr>)}</tbody></table></div>}
      <p className="note" style={{ marginTop: 12 }}>“Entregue” só aparece quando o provedor confirma. O processamento simulado termina em “Enviada”; e-mail não retorna confirmação de entrega.</p></section>
    <NewMessageDialog open={composing} onClose={() => setComposing(false)} members={members.data ?? []} />
    <BroadcastDialog open={broadcast} onClose={() => setBroadcast(false)} />
  </>;
}
function NewMessageDialog({ open, onClose, members }: { open: boolean; onClose: () => void; members: ClubMember[] }) {
  const toast = useToast(); const [memberId, setMemberId] = useState(''); const [template, setTemplate] = useState(TEMPLATES[0]); const [channel, setChannel] = useState<Channel>('WHATSAPP');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const current = members.find(m => m.id === Number(memberId));
  const close = () => { setError(''); onClose(); };
  const submit = async () => {
    if (!memberId) { setError('Selecione a integrante.'); return; }
    setBusy(true); setError('');
    try { const msg = await demoGateway.scheduleMessage(Number(memberId), template, channel); toast(`Mensagem agendada por ${channelName(msg.channel)} no simulador.`); close(); }
    catch (e) { setError(errorMessage(e, 'Não foi possível agendar.')); } finally { setBusy(false); }
  };
  return <Dialog open={open} onClose={close} overline="Mensagem individual" title="Nova mensagem" onSubmit={() => void submit()}
    footer={<><button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}><Send size={15} />{busy ? 'Agendando…' : 'Agendar mensagem'}</button></>}>
    <div className="field"><label htmlFor="cm-member">Destinatária</label><select id="cm-member" className="select" value={memberId} onChange={e => setMemberId(e.target.value)}><option value="">Selecione a integrante</option>{members.map(m => <option key={m.id} value={m.id}>{m.name} · {m.area}</option>)}</select></div>
    <div className="field"><label htmlFor="cm-tpl">Template</label><select id="cm-tpl" className="select" value={template} onChange={e => setTemplate(e.target.value)}>{TEMPLATES.map(t => <option key={t}>{t}</option>)}</select></div>
    <fieldset className="consent-box"><legend>Canal preferido</legend>{(['WHATSAPP', 'EMAIL'] as const).map(c => <label key={c} className="check-line"><input type="radio" name="channel" checked={channel === c} onChange={() => setChannel(c)} /> {channelName(c)}</label>)}
      {current && <p className="note">Autorizações: WhatsApp {current.whatsappConsent ? 'sim' : 'não'}, e-mail {current.emailConsent ? 'sim' : 'não'}. Sem autorização no canal preferido, o simulador usa o outro canal permitido.</p>}</fieldset>
    {error && <ErrorNote message={error} />}
    <p className="note">O simulador valida consentimento, limite de 2 mensagens por semana e duplicidade antes de agendar.</p>
  </Dialog>;
}

/* ── Automações ── */
export function AutomationsPage() {
  const flows = useDemoResource(demoGateway.listFlows), members = useDemoResource(demoGateway.listMembers); const toast = useToast();
  const [info, setInfo] = useState(false);
  return <section className="acard"><div className="acard-head wrap bordered"><div><p className="overline brand">Jornada automática</p><h2 className="acard-h">Automações de WhatsApp e e-mail</h2></div><button className="btn btn-primary" onClick={() => setInfo(true)}><Plus size={16} /> Criar fluxo</button></div>
    {flows.loading ? <Loading /> : <div className="flows">{JOURNEY_STEPS.map((s, i) => { const on = flows.data?.[s.id] ?? true; return <article className="flow" key={s.id}>
      <div className="flow-top"><Status tone={on ? 'ok' : 'neutral'}>{on ? 'Ativo' : 'Pausado'}</Status><span className="flow-ch">{s.channel}</span></div>
      <p className="flow-n">Etapa {i + 1} · {s.kind}</p><h3 className="flow-h">{s.label}</h3><p className="muted">{s.trigger}. {s.condition}.</p>
      <div className="flow-foot"><span><b>{members.data?.filter(m => m.stage === s.id).length ?? 0}</b> nesta etapa · espera {s.wait.toLowerCase()}</span>
        <label className="switch sm"><input type="checkbox" checked={on} aria-label={`${on ? 'Pausar' : 'Ativar'} ${s.label}`} onChange={e => void demoGateway.setFlowActive(s.id, e.target.checked).then(() => toast(`${s.label}: ${e.target.checked ? 'ativa' : 'pausada'}`))} /><span className="track" aria-hidden="true" /></label></div></article>; })}</div>}
    <p className="note" style={{ marginTop: 14 }}>Fluxo conceitual: não há agendador real conectado. Pausar uma etapa não cancela mensagens já agendadas; elas aparecem em Comunicações.</p>
    <Dialog open={info} onClose={() => setInfo(false)} overline="Novo fluxo" title="Criar fluxo" onSubmit={() => setInfo(false)} footer={<button type="submit" className="btn btn-primary">Entendi</button>}>
      <p>O editor visual de fluxos é a próxima etapa do painel. Nesta versão, a régua tem cinco etapas fixas, e cada uma pode ser pausada ou ativada aqui.</p></Dialog>
  </section>;
}

/* ── Inscrições e eventos ── */
export function EventsPage() {
  const events = useDemoResource(demoGateway.listEvents); const [checkin, setCheckin] = useState<string | null>(null); const [creating, setCreating] = useState(false);
  return <section className="acard"><div className="acard-head wrap bordered"><div><p className="overline brand">Encontros, rodas e feiras</p><h2 className="acard-h">Gestão de inscrições e rodadas</h2></div><button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Novo evento</button></div>
    {events.loading ? <Loading /> : <div className="ev-rows">{(events.data ?? []).map(e => { const left = remainingSeats(e); return <article className="ev-row" key={e.id}>
      <div><span className="pill-tag">{e.format === 'ONLINE' ? 'Online' : 'Presencial'}</span><h3 className="ev-title">{e.title}</h3>
        <p className="muted">{new Date(`${e.date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} · {e.enrolled} inscritas · {e.confirmed} confirmadas · {e.attendeeIds.length} check-ins{left != null ? ` · ${left} ${left === 1 ? 'vaga restante' : 'vagas restantes'}` : ''}</p></div>
      <button className="btn btn-ghost btn-sm" onClick={() => setCheckin(e.id)}><QrCode size={14} /> Abrir check-in</button></article>; })}</div>}
    <p className="note" style={{ marginTop: 14 }}>Inscrição não é presença: só o check-in conta como participação.</p>
    <CheckinDialog event={events.data?.find(e => e.id === checkin)} onClose={() => setCheckin(null)} />
    <NewEventDialog open={creating} onClose={() => setCreating(false)} />
  </section>;
}
function CheckinDialog({ event, onClose }: { event?: ClubEvent; onClose: () => void }) {
  const members = useDemoResource(demoGateway.listMembers); const toast = useToast(); const [error, setError] = useState('');
  const register = async (m: ClubMember) => { setError(''); try { await demoGateway.registerAttendance(event!.id, m.id); toast(`Presença de ${m.name.split(' ')[0]} registrada.`); } catch (e) { setError(errorMessage(e, 'Erro ao registrar.')); } };
  return <Dialog open={!!event} onClose={() => { setError(''); onClose(); }} overline="Check-in" title={event?.title} wide>
    <p className="note">A leitura por QR Code/token depende de backend real. Aqui a equipe registra a presença individualmente; presença duplicada é bloqueada.</p>
    {error && <ErrorNote message={error} />}
    <ul className="attend">{(members.data ?? []).map(m => { const on = !!event?.attendeeIds.includes(m.id); return <li key={m.id}><Avatar initials={initialsOf(m.name)} size="sm" /><span className="grow">{m.name}</span>
      {on ? <Status tone="ok">Presente</Status> : <button className="btn btn-primary btn-sm" onClick={() => void register(m)}>Registrar presença</button>}</li>; })}</ul>
  </Dialog>;
}
function NewEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const [form, setForm] = useState({ title: '', date: '', capacity: '30', format: 'ONLINE' as ClubEvent['format'] }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const close = () => { setError(''); onClose(); };
  const submit = async () => {
    setBusy(true); setError('');
    try { await demoGateway.createEvent({ ...form, capacity: Number.parseInt(form.capacity, 10) }); toast('Evento criado. As inscrições abrem quando o convite for disparado.'); setForm({ title: '', date: '', capacity: '30', format: 'ONLINE' }); close(); }
    catch (e) { setError(errorMessage(e, 'Não foi possível criar.')); } finally { setBusy(false); }
  };
  return <Dialog open={open} onClose={close} overline="Novo evento" title="Criar evento" onSubmit={() => void submit()}
    footer={<><button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Criando…' : 'Criar evento'}</button></>}>
    <div className="field"><label htmlFor="et">Nome do evento</label><input id="et" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
    <div className="cols"><div className="field"><label htmlFor="ed">Data</label><input id="ed" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
      <div className="field"><label htmlFor="ec">Vagas</label><input id="ec" inputMode="numeric" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div></div>
    <div className="field"><label htmlFor="ef">Formato</label><select id="ef" className="select" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value as ClubEvent['format'] }))}><option value="ONLINE">Online</option><option value="PRESENCIAL">Presencial</option></select></div>
    {error && <ErrorNote message={error} />}
  </Dialog>;
}

/* ── Relatórios ── */
export function ReportsPage() {
  const members = useDemoResource(demoGateway.listMembers), comm = useDemoResource(demoGateway.listMessages), events = useDemoResource(demoGateway.listEvents);
  const ms = members.data ?? [], total = Math.max(ms.length, 1);
  const stats = useMemo(() => { const m = comm.data ?? []; return { sent: m.filter(x => ['SENT', 'DELIVERED'].includes(x.status)).length, failed: m.filter(x => x.status === 'FAILED').length, attended: (events.data ?? []).reduce((acc, e) => acc + e.attendeeIds.length, 0) }; }, [comm.data, events.data]);
  const funnel: [string, number][] = [['Integrantes da amostra', ms.length], ['Perfis na etapa de conexão', ms.filter(m => m.stage === 'opportunity').length], ['Presenças registradas', stats.attended]];
  return <>
    <section className="adm-metrics four" aria-label="Indicadores">{([['Amostra cadastrada', ms.length], ['Envios simulados concluídos', stats.sent], ['Falhas registradas', stats.failed], ['Presenças registradas', stats.attended]] as const).map(([l, v]) =>
      <article className="mcard" key={l}><div className="mcard-top"><span>{l}</span></div><p className="mcard-n">{v}</p></article>)}</section>
    <div className="adm-grid">
      <section className="acard span2"><h2 className="acard-h sm" style={{ marginBottom: 18 }}>Funil de participação</h2><ul className="funnel-bars">{funnel.map(([l, n]) =>
        <li key={l}><div className="fb-label"><span>{l}</span><b>{n}</b></div><div className="fb-track"><i style={{ transform: `scaleX(${Math.min(1, n / total)})` }} /></div></li>)}</ul></section>
      <aside className="acard"><h2 className="acard-h sm">Como interpretar</h2><p className="muted" style={{ marginTop: 8 }}>Os dados são uma amostra fictícia, não taxas reais da Kawaii. Abertura de e-mail não comprova leitura; mensagem entregue não comprova participação.</p>
        <p className="muted">Para a métrica norte, observe acordos executados e confirmados pelas partes.</p><Status tone="brand">Sem projeção de ROI</Status></aside>
    </div></>;
}
