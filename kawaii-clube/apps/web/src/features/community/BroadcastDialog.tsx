import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Channel, SegmentId } from '../../domain/types.ts';
import { SEGMENTS, campaignReach } from '../../domain/campaign.ts';
import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { Dialog } from '../../components/Dialog.tsx';
import { ErrorNote, errorMessage } from '../../components/Shared.tsx';
import { useToast } from '../../components/Toast.tsx';
const plural = (n: number) => `${n} ${n === 1 ? 'integrante' : 'integrantes'}`;
/** Comunicado para um segmento. Agenda na fila simulada; o processamento é um passo separado em Comunicações. */
export function BroadcastDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const members = useDemoResource(demoGateway.listMembers); const toast = useToast(); const navigate = useNavigate();
  const [segment, setSegment] = useState<SegmentId>('active'); const [channel, setChannel] = useState<Channel>('WHATSAPP');
  const [title, setTitle] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const reach = campaignReach(members.data ?? [], segment, channel);
  const close = () => { setError(''); onClose(); };
  const submit = async () => {
    setBusy(true); setError('');
    try {
      const c = await demoGateway.createCampaign({ title, message, segment, channel });
      toast(`Disparo agendado para ${plural(c.audience)}${c.excluded ? `; ${c.excluded} sem consentimento ficaram de fora` : ''}.`);
      setTitle(''); setMessage(''); close(); navigate('/admin/comunicacoes');
    } catch (err) { setError(errorMessage(err, 'Não foi possível agendar.')); } finally { setBusy(false); }
  };
  return <Dialog open={open} onClose={close} overline="Comunicação oficial" title="Disparo para a comunidade" onSubmit={() => void submit()}
    footer={<><button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Agendando…' : 'Agendar disparo'}</button></>}>
    <div className="cols">
      <div className="field"><label htmlFor="bc-seg">Segmento</label><select id="bc-seg" className="select" value={segment} onChange={e => setSegment(e.target.value as SegmentId)}>{(Object.keys(SEGMENTS) as SegmentId[]).map(k => <option key={k} value={k}>{SEGMENTS[k].label}</option>)}</select></div>
      <div className="field"><label htmlFor="bc-ch">Canal</label><select id="bc-ch" className="select" value={channel} onChange={e => setChannel(e.target.value as Channel)}><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">E-mail</option></select></div>
    </div>
    <p className="reach" aria-live="polite">Alcance: <b>{plural(reach.reachable)}</b> com consentimento em {channel === 'WHATSAPP' ? 'WhatsApp' : 'e-mail'}{reach.total - reach.reachable ? ` · ${reach.total - reach.reachable} sem consentimento não recebem` : ''}.</p>
    <div className="field"><label htmlFor="bc-title">Título</label><input id="bc-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Novas oportunidades de parceria abertas" /></div>
    <div className="field"><label htmlFor="bc-msg">Mensagem</label><textarea id="bc-msg" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva o comunicado" /></div>
    {error && <ErrorNote message={error} />}
    <p className="note">Simulação: nenhuma mensagem real é enviada. O status muda só quando a fila for processada.</p>
  </Dialog>;
}
