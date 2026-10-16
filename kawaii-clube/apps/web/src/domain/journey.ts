import type { ClubMember, JourneyStage } from './types.ts';
import { DomainError } from './types.ts';
import { JOURNEY_LABEL } from './policies.ts';
export interface JourneyStep { id: JourneyStage; label: string; kind: 'Gatilho' | 'Mensagem' | 'Condição'; trigger: string; condition: string; channel: string; wait: string }
/** Régua conceitual de ativação. Sem agendador real conectado neste protótipo. */
export const JOURNEY_STEPS: JourneyStep[] = [
  { id: 'joined', label: JOURNEY_LABEL.joined, kind: 'Gatilho', trigger: 'Cadastro concluído no App', condition: 'Consentimento registrado', channel: 'WhatsApp + e-mail', wait: 'Imediato' },
  { id: 'welcome', label: JOURNEY_LABEL.welcome, kind: 'Mensagem', trigger: 'D0 após o cadastro', condition: 'Ainda não recebeu boas-vindas', channel: 'WhatsApp curto, e-mail completo', wait: 'Uma vez' },
  { id: 'profile', label: JOURNEY_LABEL.profile, kind: 'Condição', trigger: 'D3 sem perfil completo', condition: 'Oferta, necessidade ou área vazias', channel: 'WhatsApp ou e-mail', wait: '3 dias' },
  { id: 'event', label: JOURNEY_LABEL.event, kind: 'Mensagem', trigger: 'D5 sem inscrição', condition: 'Existe encontro aberto', channel: 'WhatsApp + e-mail', wait: '2 dias' },
  { id: 'opportunity', label: JOURNEY_LABEL.opportunity, kind: 'Mensagem', trigger: 'D7 sem conversa aberta', condition: 'Match qualificado e sem contato ativo', channel: 'WhatsApp ou e-mail', wait: '2 dias' }
];
export type EngagementTone = 'ok' | 'warn' | 'neutral';
/** Faixas ilustrativas de engajamento em 30 dias. */
export function engagementLevel(score: number): { label: string; tone: EngagementTone } {
  if (score >= 40) return { label: 'Ativa', tone: 'ok' };
  if (score >= 10) return { label: 'Em atenção', tone: 'warn' };
  return { label: 'Baixa atividade', tone: 'neutral' };
}
export function initialsOf(name: string): string { return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
/** Nova integrante entra na etapa Cadastro, sem pontuação e só com os canais autorizados. */
export function createMember(input: { id: number; name: string; area: string; whatsappConsent: boolean; emailConsent: boolean }): ClubMember {
  const name = input.name.trim(), area = input.area.trim();
  if (!name || !area) throw new DomainError('INVALID_INPUT', 'Informe nome e área de atuação.');
  return {
    id: input.id, name, area, stage: 'joined', whatsappConsent: input.whatsappConsent, emailConsent: input.emailConsent,
    engagementScore: 0, lastActivity: 'Agora', phoneMasked: '(11) *****-**' + String(input.id).slice(-2).padStart(2, '0'), emailMasked: '***@exemplo.com'
  };
}
