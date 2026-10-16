import type { ReactNode } from 'react';
import { Check, Info, LoaderCircle } from 'lucide-react';
import { EVIDENCE_LABEL, MODALITY_LABEL, MESSAGE_LABEL } from '../domain/policies.ts';
import type { CampaignStatus, EvidenceStatus, MessageStatus, Modality, PartnershipStatus, ProposalStatus } from '../domain/types.ts';
export type Tone = 'ok' | 'warn' | 'err' | 'info' | 'brand' | 'neutral';
export function Status({ tone, children }: { tone: Tone; children: ReactNode }) { return <span className={`st st-${tone}`}>{children}</span>; }
export function ModalityPill({ modality }: { modality: Modality }) { return <span className="pill">{MODALITY_LABEL[modality]}</span>; }
export function Avatar({ initials, size = 'md', company }: { initials: string; size?: 'sm' | 'md' | 'lg'; company?: boolean }) {
  return <span className={`av av-${size} ${company ? 'co' : ''}`} aria-hidden="true">{initials}</span>;
}
export function EvidenceIcon({ status }: { status: EvidenceStatus }) {
  return <span className={`ev-ic ${status}`} role="img" aria-label={EVIDENCE_LABEL[status]}>{status === 'confirmed' ? <Check size={11} strokeWidth={3} /> : status === 'inferred' ? '?' : '!'}</span>;
}
export function EvidenceList({ evidence }: { evidence: { criterion: string; detail: string; source: string; status: EvidenceStatus }[] }) {
  return <ul className="m-ev">{evidence.map((e, i) => <li key={`${e.criterion}-${i}`}><EvidenceIcon status={e.status} />
    <div><b>{e.criterion}</b> <span className={`tag ${e.status}`}>{EVIDENCE_LABEL[e.status]}</span><p>{e.detail}</p><small>Fonte: {e.source}</small></div></li>)}</ul>;
}
const MESSAGE_TONE: Record<MessageStatus, Tone> = { SCHEDULED: 'neutral', PROCESSING: 'brand', SENT: 'warn', DELIVERED: 'ok', FAILED: 'err', CANCELED: 'neutral' };
export function MessageStatusTag({ status }: { status: MessageStatus }) { return <Status tone={MESSAGE_TONE[status]}>{MESSAGE_LABEL[status]}</Status>; }
const CAMPAIGN_STATUS: Record<CampaignStatus, [string, Tone]> = { SCHEDULED: ['Agendado', 'neutral'], PROCESSING: ['Processando', 'brand'], SENT: ['Enviado (simulado)', 'warn'], FAILED: ['Falhou', 'err'] };
export function CampaignStatusTag({ status }: { status: CampaignStatus }) { const [l, t] = CAMPAIGN_STATUS[status]; return <Status tone={t}>{l}</Status>; }
export const PROPOSAL_STATUS: Record<ProposalStatus | PartnershipStatus, [string, Tone]> = {
  DRAFT: ['Rascunho salvo', 'info'], READY_FOR_REVIEW: ['Pronta para envio', 'ok'], SENT: ['Proposta enviada', 'ok'], ACCEPTED: ['Aceita pelas duas', 'ok'],
  REJECTED: ['Recusada', 'neutral'], EXECUTED: ['Entrega confirmada', 'ok'], NEGOTIATING: ['Em negociação', 'warn']
};
export function ProposalStatusTag({ status }: { status: ProposalStatus | PartnershipStatus }) { const [l, t] = PROPOSAL_STATUS[status]; return <Status tone={t}>{l}</Status>; }
export function Empty({ title, text, children, error }: { title: string; text: string; children?: ReactNode; error?: boolean }) {
  return <div className={`empty ${error ? 'err' : ''}`} role={error ? 'alert' : undefined}><Info size={26} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p>{children}</div></div>;
}
export function Loading({ label = 'Carregando dados de demonstração…' }: { label?: string }) { return <div className="loading" role="status"><LoaderCircle size={18} className="spin" aria-hidden="true" /> {label}</div>; }
export function SkeletonCards({ count = 2 }: { count?: number }) {
  return <div className="u-cards" aria-busy="true">{Array.from({ length: count }, (_, i) => <div key={i} className="skel" aria-hidden="true"><i style={{ width: '40%' }} /><i style={{ width: '85%', height: 16 }} /><i className="box" /><i className="btn" /></div>)}<p className="sr">Carregando</p></div>;
}
export function ErrorNote({ message }: { message: string }) { return <div className="alert err" role="alert">{message}</div>; }
export function DemoNotice() { return <p className="banner">Protótipo com dados fictícios e API simulada no formato da Kawaii ({'{ success, data }'}). Não representa integração com produção e não realiza envios reais.</p>; }
export const errorMessage = (err: unknown, fallback: string) => err instanceof Error ? err.message : fallback;
export const shortDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ');
