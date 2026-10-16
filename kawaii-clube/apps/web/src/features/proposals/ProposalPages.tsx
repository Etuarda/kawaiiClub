import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileCheck2, Plus, Save } from 'lucide-react';
import type { Modality, Opportunity, PartnershipStatus, Proposal, ProposalFields, ProposalStatus } from '../../domain/types.ts';
import { MODALITY_LABEL } from '../../domain/policies.ts';
import { validateProposalFields } from '../../domain/proposal.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { DEMO_USER } from '../../infrastructure/fixtures.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { Avatar, Empty, ErrorNote, EvidenceIcon, Loading, ModalityPill, ProposalStatusTag, errorMessage, shortDate } from '../../components/Shared.tsx';
import { useToast } from '../../components/Toast.tsx';
import { PartnershipDialog } from './PartnershipDialog.tsx';
const LABELS: Record<keyof ProposalFields, string> = { objective: 'Objetivo da parceria', scope: 'Escopo e entregas', contribution: 'Minha contribuição', counterpart: 'Contribuição da outra parte', terms: 'Termos e condições', deadline: 'Prazo previsto' };
const REQUIRED: (keyof ProposalFields)[] = ['objective', 'scope', 'contribution', 'counterpart'];
interface Row { key: string; partner: { name: string; business: string; initials: string }; objective: string; modality: Modality; status: ProposalStatus | PartnershipStatus; date: string; draftId?: number; partnershipId?: string }
export function ProposalsPage() {
  const proposals = useDemoResource(demoGateway.listProposals), partnerships = useDemoResource(demoGateway.listPartnerships), opportunities = useDemoResource(demoGateway.listOpportunities);
  const navigate = useNavigate(); const toast = useToast(); const [open, setOpen] = useState<string | null>(null);
  if (proposals.loading || partnerships.loading) return <Loading />;
  const rows: Row[] = [
    ...(proposals.data ?? []).sort((a, b) => b.id - a.id).map(d => {
      const op = opportunities.data?.find(o => o.matchRef === d.matchRef);
      return { key: `d${d.id}`, partner: op ? { name: op.candidate.name, business: op.candidate.business, initials: op.candidate.initials } : { name: `Parceira #${d.counterpartyId}`, business: '—', initials: '?' }, objective: d.fields.objective, modality: op?.modality ?? 'COLLAB', status: d.status, date: d.updatedAt, draftId: d.id };
    }),
    ...(partnerships.data ?? []).map(p => ({ key: p.id, partner: p.partner, objective: p.objective, modality: p.modality, status: p.status, date: p.date, partnershipId: p.id }))
  ];
  return <><h1 className="sr">Minhas propostas</h1>
    <section className="u-card"><div className="u-card-top"><div><h2 className="u-card-title">Minhas propostas e negociações</h2><p className="muted">Acompanhe o status e a próxima ação de cada parceria em andamento.</p></div>
      <button className="btn btn-primary" onClick={() => { navigate('/app/oportunidades'); toast('Toda proposta começa de uma oportunidade: escolha uma e toque em Criar proposta.'); }}><Plus size={15} /> Criar nova proposta</button></div>
      {!rows.length ? <Empty title="Nenhuma proposta ainda" text="Abra uma oportunidade e toque em Criar proposta. O rascunho já vem preenchido com o contexto da recomendação." />
        : <div className="table-wrap flat"><table><caption className="sr">Propostas</caption><thead><tr><th scope="col">Parceira</th><th scope="col">Objetivo</th><th scope="col">Modalidade</th><th scope="col">Status</th><th scope="col">Data</th><th scope="col" className="r">Ação</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.key}><td><div className="cell-who"><Avatar initials={r.partner.initials} size="sm" /><div>{r.draftId ? <Link className="name-link" to={`/app/propostas/${r.draftId}`}><b>{r.partner.name}</b></Link> : <button type="button" className="name-link" onClick={() => setOpen(r.partnershipId!)}><b>{r.partner.name}</b></button>}<small>{r.partner.business}</small></div></div></td><td>{r.objective}</td><td><ModalityPill modality={r.modality} /></td><td><ProposalStatusTag status={r.status} /></td><td className="muted nowrap">{shortDate(r.date)}</td>
            <td className="r">{r.draftId ? <Link className="btn btn-gold btn-sm" to={`/app/propostas/${r.draftId}`}>{r.status === 'DRAFT' ? 'Editar rascunho' : 'Abrir proposta'}</Link> : <button className="btn btn-primary btn-sm" onClick={() => setOpen(r.partnershipId!)}>Acompanhar</button>}</td></tr>)}</tbody></table></div>}
      <p className="note" style={{ marginTop: 12 }}>Envio, aceite e entrega de rascunhos novos são as próximas etapas do produto. As negociações listadas são histórico fictício.</p>
    </section>
    <PartnershipDialog id={open} onClose={() => setOpen(null)} />
  </>;
}
type Step = 'edit' | 'review' | 'done';
type SaveState = 'saved' | 'dirty' | 'busy' | 'err';
const STEPS: [Step, string][] = [['edit', 'Conteúdo'], ['review', 'Revisão'], ['done', 'Concluída']];
function Stepper({ step }: { step: Step }) {
  const at = STEPS.findIndex(s => s[0] === step), finished = step === 'done';
  return <ol className="stepper" aria-label="Etapas da proposta">{STEPS.map(([id, label], i) => <li key={id} className={i < at || finished ? 'done' : i === at ? 'on' : ''} aria-current={i === at ? 'step' : undefined}>
    {i > 0 && <span className={`line ${i <= at ? 'done' : ''}`} aria-hidden="true"><i /></span>}<span className="n">{i < at || finished ? <Check size={12} /> : i + 1}</span>{label}</li>)}</ol>;
}
function ReadOnly({ fields }: { fields: ProposalFields }) {
  return <div className="read">{(Object.keys(LABELS) as (keyof ProposalFields)[]).map(k => <div className="blk" key={k}><span className="lbl">{LABELS[k]}</span>
    <p>{fields[k] ? (k === 'deadline' ? new Date(`${fields[k]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : fields[k]) : <span className="missing">Não preenchido</span>}</p></div>)}</div>;
}
export function ProposalEditor() {
  const { id } = useParams(); const toast = useToast();
  const { data, loading } = useDemoResource(demoGateway.listProposals); const opportunities = useDemoResource(demoGateway.listOpportunities);
  const draft = data?.find(d => d.id === Number(id));
  const [fields, setFields] = useState<ProposalFields | null>(null); const [version, setVersion] = useState(0); const [status, setStatus] = useState<ProposalStatus>('DRAFT');
  const [step, setStep] = useState<Step>('edit'); const [save, setSave] = useState<SaveState>('saved'); const [error, setError] = useState(''); const [invalid, setInvalid] = useState<(keyof ProposalFields)[]>([]);
  useEffect(() => { if (draft && version === 0) { setFields(structuredClone(draft.fields)); setVersion(draft.version); setStatus(draft.status); setStep(draft.status === 'DRAFT' ? 'edit' : 'done'); } }, [draft, version]);
  if (loading || (draft && !fields)) return <Loading />;
  if (!draft || !fields) return <Empty title="Rascunho não encontrado" text="Abra uma oportunidade para começar uma proposta."><Link className="btn btn-primary" to="/app/oportunidades">Ver oportunidades</Link></Empty>;
  const op: Opportunity | undefined = opportunities.data?.find(o => o.matchRef === draft.matchRef);
  const missing = REQUIRED.filter(k => !fields[k].trim());
  const onChange = (key: keyof ProposalFields, value: string) => { setFields(f => f && { ...f, [key]: value }); setSave('dirty'); setInvalid(list => list.filter(k => k !== key)); };
  const persist = async (review: boolean) => {
    setSave('busy'); setError('');
    try {
      const result: Proposal = await demoGateway.updateDraft(draft.id, version, fields, review);
      setVersion(result.version); setStatus(result.status); setSave('saved');
      if (review) { setStep('done'); toast('Revisão concluída. Nenhum envio externo foi realizado.'); } else toast('Rascunho salvo');
    } catch (err) { setSave('err'); setError(errorMessage(err, 'Não foi possível salvar.')); }
  };
  const toReview = () => {
    try { validateProposalFields(fields); setInvalid([]); setError(''); setStep('review'); window.scrollTo({ top: 0 }); }
    catch (err) { setInvalid(missing); setError(errorMessage(err, 'Revise os campos marcados.')); }
  };
  const saveLabel = { saved: `Salvo · versão ${version}`, dirty: 'Alterações não salvas', busy: 'Salvando…', err: 'Não salvo' }[save];
  return <>
    <Link to="/app/propostas" className="crumb"><ArrowLeft size={15} className="arrow" /> Minhas propostas</Link>
    <div className="ed-top"><Stepper step={step} /><span className={`savestate ${save}`} role="status" aria-live="polite"><i aria-hidden="true" /><span>{saveLabel}</span></span></div>
    <div className="editor">
      <div>{error && <ErrorNote message={error} />}
        <article className="paper" aria-labelledby="doc-title">
          <p className="overline">Criar proposta de parceria · {op ? MODALITY_LABEL[op.modality] : 'Rascunho'}</p>
          <h1 id="doc-title" className="doc-title">Formulário de alinhamento estratégico</h1>
          {op && <p className="doc-sub">Pré-preenchido com base no match com {op.candidate.name}.</p>}
          <div className="parties"><div><small>Participantes</small><b>{DEMO_USER.name}</b><br />{DEMO_USER.business}</div><div><small>Com</small><b>{op?.candidate.name ?? '—'}</b><br />{op?.candidate.business}</div><div><small>Com base em</small><span>{op?.title ?? draft.matchRef}</span></div></div>
          {step === 'edit' ? <form noValidate onSubmit={e => { e.preventDefault(); void persist(false); }}>
            {(Object.keys(LABELS) as (keyof ProposalFields)[]).map(k => { const req = REQUIRED.includes(k), bad = invalid.includes(k);
              return <div key={k} className={`field ${bad ? 'bad' : ''}`}><label htmlFor={`f-${k}`}>{LABELS[k]}{!req && <span className="opt"> (opcional)</span>}</label>
                {k === 'deadline' ? <input id={`f-${k}`} type="date" value={fields[k]} onChange={e => onChange(k, e.target.value)} />
                  : <textarea id={`f-${k}`} rows={k === 'scope' ? 4 : 3} value={fields[k]} maxLength={k === 'scope' ? 5000 : 1000} aria-required={req} aria-invalid={bad} aria-describedby={bad ? `e-${k}` : undefined} onChange={e => onChange(k, e.target.value)} />}
                {bad && <div className="errmsg" id={`e-${k}`}>Preencha este campo.</div>}</div>; })}
            <button type="submit" hidden /></form>
            : <>{step === 'done' && <div className="alert ok">A proposta está pronta para envio. Enviar é a próxima etapa do produto e exige a sua confirmação; o aceite acontece com as duas partes.</div>}<ReadOnly fields={fields} /></>}
        </article></div>
      <aside className="rail" aria-label="Resumo e ações">
        <div className="card summary"><h3>Resumo da parceria</h3><dl><dt>Modalidade</dt><dd>{op ? MODALITY_LABEL[op.modality] : '—'}</dd><dt>Relação</dt><dd>{op?.relation === 'COMPANY' ? 'Empresa e empreendedora' : 'Entre empreendedoras'}</dd><dt>Prazo</dt><dd>{fields.deadline ? shortDate(fields.deadline) : '—'}</dd><dt>Estado</dt><dd><ProposalStatusTag status={status} /></dd></dl></div>
        <div className="card"><h3>{step === 'done' ? 'Para combinar no envio' : 'Antes de concluir'}</h3>
          <ul className="check"><li><EvidenceIcon status={missing.length ? 'missing' : 'confirmed'} /><span>{missing.length ? `${missing.length} ${missing.length === 1 ? 'campo obrigatório vazio' : 'campos obrigatórios vazios'}` : 'Campos obrigatórios preenchidos'}</span></li>
            {op?.evidence.filter(e => e.status !== 'confirmed').map(e => <li key={e.criterion}><EvidenceIcon status={e.status} /><span>Confirme com {op.candidate.name.split(' ')[0]}: {e.criterion.toLowerCase()}</span></li>)}</ul>
          <div className="acts">
            {step === 'edit' && <><button className="btn btn-primary" disabled={save === 'busy'} onClick={toReview}>Revisar proposta <ArrowRight size={15} className="arrow" /></button><button className="btn btn-ghost" disabled={save === 'busy'} onClick={() => void persist(false)}><Save size={15} /> Salvar rascunho</button></>}
            {step === 'review' && <><button className="btn btn-primary" disabled={save === 'busy'} onClick={() => void persist(true)}><FileCheck2 size={15} /> Concluir revisão</button><button className="btn btn-ghost" onClick={() => setStep('edit')}>Voltar e editar</button></>}
            {step === 'done' && <><Link className="btn btn-primary" to="/app/propostas">Ver suas propostas</Link><button className="btn btn-ghost" onClick={() => setStep('edit')}>Editar novamente</button></>}
            <p className="note">Concluir não envia. O rascunho tem controle de versão e chave idempotente.</p></div></div>
      </aside>
    </div></>;
}
