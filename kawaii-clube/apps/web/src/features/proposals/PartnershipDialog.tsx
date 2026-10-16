import { useState } from 'react';
import { Check } from 'lucide-react';
import { canConfirmAcceptance } from '../../domain/partnership.ts';
import { MODALITY_LABEL } from '../../domain/policies.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { DEMO_USER } from '../../infrastructure/fixtures.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { Dialog } from '../../components/Dialog.tsx';
import { ErrorNote, ProposalStatusTag, errorMessage, shortDate } from '../../components/Shared.tsx';
import { useToast } from '../../components/Toast.tsx';
/** Detalhes de uma negociação: aceite bilateral e histórico. */
export function PartnershipDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data } = useDemoResource(demoGateway.listPartnerships); const toast = useToast();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const p = data?.find(x => x.id === id); const first = p?.partner.name.split(' ')[0];
  const acceptable = p ? canConfirmAcceptance(p) : false;
  const close = () => { setError(''); onClose(); };
  const accept = async () => {
    if (!p) return; setBusy(true); setError('');
    try { const next = await demoGateway.acceptPartnership(p.id); toast(next.status === 'ACCEPTED' ? 'Parceria aceita pelas duas partes. A entrega ainda precisa ser confirmada.' : 'Seu aceite foi registrado.'); }
    catch (err) { setError(errorMessage(err, 'Não foi possível registrar o aceite.')); } finally { setBusy(false); }
  };
  return <Dialog open={!!p} onClose={close} overline="Detalhes da parceria" title={p?.partner.business} onSubmit={() => { if (acceptable) void accept(); else close(); }}
    footer={acceptable ? <><button type="button" className="btn btn-ghost" onClick={close}>Fechar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar meu aceite'}</button></> : <button type="submit" className="btn btn-ghost">Fechar</button>}>
    {p && <>
      <div><ProposalStatusTag status={p.status} /></div>
      <div className="m-box"><p><b>Objetivo:</b> {p.objective}</p><p><b>Participantes:</b> {DEMO_USER.name} e {p.partner.name}</p><p><b>Modalidade:</b> {MODALITY_LABEL[p.modality]}</p></div>
      <div className="m-accept"><div><span className="lbl">Seu aceite</span><b>{p.myAcceptance ? <><Check size={13} /> confirmado</> : 'pendente'}</b></div><div><span className="lbl">Aceite de {first}</span><b>{p.theirAcceptance ? <><Check size={13} /> confirmado</> : 'pendente'}</b></div></div>
      <h3 className="m-h">Histórico de atualizações e negociação</h3>
      <ol className="m-timeline">{p.history.map((h, i) => <li key={i}><b>{shortDate(h.date)} · {h.title}</b><p>{h.detail}</p></li>)}</ol>
      {error && <ErrorNote message={error} />}
      <p className="note">{acceptable ? 'O aceite precisa das duas partes. Aceitar não marca a entrega como feita.' : p.status === 'SENT' ? `Aguardando a resposta de ${first}.` : 'A parceria só conta como efetiva quando a entrega for confirmada pelas duas partes.'}</p>
    </>}
  </Dialog>;
}
