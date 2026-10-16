import type { Campaign, CampaignStatus, Channel, ClubMember, SegmentId } from './types.ts';
import { DomainError } from './types.ts';
export const SEGMENTS: Record<SegmentId, { label: string; includes: (m: ClubMember) => boolean }> = {
  active: { label: 'Integrantes com atividade recente', includes: m => m.engagementScore >= 10 },
  onboarding: { label: 'Em integração (cadastro a perfil)', includes: m => ['joined', 'welcome', 'profile'].includes(m.stage) },
  event: { label: 'Etapa: convite para evento', includes: m => m.stage === 'event' },
  opportunity: { label: 'Etapa: primeira conexão', includes: m => m.stage === 'opportunity' }
};
const consents = (m: ClubMember, channel: Channel) => channel === 'WHATSAPP' ? m.whatsappConsent : m.emailConsent;
/** Alcance real do disparo: só quem autorizou o canal escolhido recebe. */
export function campaignReach(members: ClubMember[], segment: SegmentId, channel: Channel): { total: number; reachable: number } {
  const base = members.filter(SEGMENTS[segment].includes);
  return { total: base.length, reachable: base.filter(m => consents(m, channel)).length };
}
export function createCampaign(args: { id: string; title: string; message: string; segment: SegmentId; channel: Channel; members: ClubMember[]; now: string }): Campaign {
  const title = args.title.trim(), message = args.message.trim();
  if (!title || !message) throw new DomainError('INVALID_INPUT', 'Escreva título e mensagem.');
  const { total, reachable } = campaignReach(args.members, args.segment, args.channel);
  if (!reachable) throw new DomainError('SEND_NOT_ALLOWED', 'Ninguém neste segmento autorizou este canal.');
  return { id: args.id, title, message, segment: args.segment, channel: args.channel, audience: reachable, excluded: total - reachable, status: 'SCHEDULED', createdAt: args.now };
}
/** Sem confirmação do provedor, o disparo termina em SENT; entrega nunca é presumida. */
export function transitionCampaign(c: Campaign, next: CampaignStatus): Campaign {
  const allowed: Record<CampaignStatus, CampaignStatus[]> = { SCHEDULED: ['PROCESSING'], PROCESSING: ['SENT', 'FAILED'], SENT: [], FAILED: ['SCHEDULED'] };
  if (!allowed[c.status].includes(next)) throw new DomainError('CONFLICT', `Transição ${c.status} → ${next} não permitida.`);
  return { ...c, status: next };
}
