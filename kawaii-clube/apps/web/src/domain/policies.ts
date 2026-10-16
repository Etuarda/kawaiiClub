import type { Channel, ClubMember, Evidence, Modality, Opportunity } from './types.ts';
import { DomainError } from './types.ts';
export const MODALITY_LABEL: Record<Modality, string> = { SUPPORT: 'Apoio', EXCHANGE: 'Permuta', COLLAB: 'Collab' };
export const JOURNEY_LABEL: Record<ClubMember['stage'], string> = {
  joined: 'Cadastro', welcome: 'Boas-vindas', profile: 'Verificar perfil', event: 'Evento', opportunity: 'Primeira conexão'
};
export const MESSAGE_LABEL = { SCHEDULED: 'Agendada', PROCESSING: 'Processando', SENT: 'Enviada', DELIVERED: 'Entregue', FAILED: 'Falhou', CANCELED: 'Cancelada' } as const;
export const EVIDENCE_LABEL = { confirmed: 'Confirmado', inferred: 'A confirmar', missing: 'Não informado' } as const;
export const MATCH_RULES: Record<Modality, string[]> = {
  SUPPORT: ['Necessidade comprovada', 'Competência adequada', 'Disponibilidade para apoio'],
  EXCHANGE: ['Oferta da parceira atende a necessidade', 'Contrapartida da participante atende a parceira', 'Duas entregas viáveis'],
  COLLAB: ['Objetivo compartilhado', 'Competências complementares', 'Condições de execução compatíveis']
};
/** A política de dois sinais é histórica, não aplicada globalmente por presunção. */
export function confirmedCount(evidence: Evidence[]): number { return evidence.filter(e => e.status === 'confirmed').length; }
export function validateEligibility(opportunity: Opportunity, requesterId: number): void {
  if (opportunity.status !== 'ACTIVE') throw new DomainError('NOT_ELIGIBLE', 'A oportunidade não está mais ativa.');
  if (opportunity.candidate.id === requesterId || opportunity.creatorId === opportunity.candidate.id) throw new DomainError('NOT_ELIGIBLE', 'Não é permitido criar parceria consigo mesma.');
  if (opportunity.evidence.some(e => e.status === 'missing' && /obrigat|exigên|prazo/i.test(e.criterion))) throw new DomainError('NOT_ELIGIBLE', 'Há um requisito obrigatório ainda não confirmado.');
}
/** Preferência por WhatsApp com fallback para e-mail autorizado. Não equivale a comprovar consentimento jurídico. */
export function selectChannel(member: ClubMember, preferred?: Channel): Channel {
  if (preferred === 'WHATSAPP' && member.whatsappConsent) return 'WHATSAPP';
  if (preferred === 'EMAIL' && member.emailConsent) return 'EMAIL';
  if (member.whatsappConsent) return 'WHATSAPP';
  if (member.emailConsent) return 'EMAIL';
  throw new DomainError('SEND_NOT_ALLOWED', 'A integrante não autorizou nenhum canal disponível.');
}
export function assertCommunicationAllowed(member: ClubMember, communicationsInWindow: number, max = 2): void {
  selectChannel(member);
  if (communicationsInWindow >= max) throw new DomainError('SEND_NOT_ALLOWED', 'Limite de mensagens alcançado nesta janela.');
}
