/** Contratos de domínio da demonstração. Não confundir com tabelas Prisma existentes. */
export type Role = 'MEMBER' | 'ADMIN';
export type Modality = 'SUPPORT' | 'EXCHANGE' | 'COLLAB';
export type Relation = 'PEER' | 'COMPANY';
export type EvidenceStatus = 'confirmed' | 'inferred' | 'missing';
export type JourneyStage = 'joined' | 'welcome' | 'profile' | 'event' | 'opportunity';
export type Channel = 'WHATSAPP' | 'EMAIL';
export type MessageStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELED';
export type ProposalStatus = 'DRAFT' | 'READY_FOR_REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXECUTED';
export type OpportunityStatus = 'ACTIVE' | 'CLOSED';
export interface Evidence { criterion: string; detail: string; source: string; status: EvidenceStatus }
export interface Participant { id: number; name: string; business: string; expertise: string; initials: string; location: string; offered: string[]; needs: string[] }
export interface Opportunity {
  id: number; matchRef: string; title: string; description: string;
  modality: Modality; relation: Relation; status: OpportunityStatus;
  creatorId: number; candidate: Participant; evidence: Evidence[];
  explanation: string; policyVersion: string; deadline?: string;
}
export interface ProposalFields {
  objective: string; scope: string; contribution: string; counterpart: string;
  terms: string; deadline: string;
}
export interface Proposal {
  id: number; matchRef: string; opportunityId: number; authorId: number;
  counterpartyId: number; version: number; status: ProposalStatus;
  fields: ProposalFields; createdAt: string; updatedAt: string;
}
export interface ClubMember {
  id: number; name: string; area: string; stage: JourneyStage;
  whatsappConsent: boolean; emailConsent: boolean; engagementScore: number;
  lastActivity: string; phoneMasked: string; emailMasked: string;
}
export interface Communication {
  id: string; memberId: number; channel: Channel; template: string;
  status: MessageStatus; scheduledAt: string; updatedAt: string;
  attempt: number; error?: string;
}
export interface ClubEvent {
  id: string; title: string; date: string; format: 'ONLINE' | 'PRESENCIAL';
  enrolled: number; confirmed: number; attendeeIds: number[]; capacity?: number;
}
export type PartnershipStatus = 'NEGOTIATING' | 'SENT' | 'ACCEPTED';
export interface PartnershipEntry { date: string; title: string; detail: string }
/** Negociação já iniciada (histórico fictício). Aceite exige as duas partes; entrega é etapa posterior. */
export interface Partnership {
  id: string; partner: { name: string; business: string; initials: string };
  objective: string; modality: Modality; status: PartnershipStatus; date: string;
  myAcceptance: boolean; theirAcceptance: boolean; history: PartnershipEntry[];
}
export interface ProfessionalProfile {
  area: string; offers: string; needs: string; goals: string; audience: string;
  modalities: Modality[]; relations: Relation[]; availability: string; invoice: string;
  whatsapp: boolean; email: boolean;
}
export type SegmentId = 'active' | 'onboarding' | 'event' | 'opportunity';
export type CampaignStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
export interface Campaign {
  id: string; title: string; message: string; segment: SegmentId; channel: Channel;
  audience: number; excluded: number; status: CampaignStatus; createdAt: string;
}
export interface TelemetryEvent {
  id: string; type: string; entityId: string; occurredAt: string; details?: Record<string, string | number | boolean>;
}
export interface DemoData {
  opportunities: Opportunity[]; proposals: Proposal[];
  members: ClubMember[]; communications: Communication[];
  events: ClubEvent[]; telemetry: TelemetryEvent[];
  idempotency: Record<string, { hash: string; proposalId: number }>;
  nextProposalId: number;
  saved: string[]; dismissed: string[];
  partnerships: Partnership[]; profile: ProfessionalProfile;
  flows: Record<JourneyStage, boolean>; campaigns: Campaign[];
}
export type ApiErrorCode = 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'NOT_ELIGIBLE' | 'INVALID_INPUT' | 'SEND_NOT_ALLOWED' | 'SERVICE_UNAVAILABLE';
export class DomainError extends Error {
  readonly code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) { super(message); this.code = code; this.name = 'DomainError'; }
}
