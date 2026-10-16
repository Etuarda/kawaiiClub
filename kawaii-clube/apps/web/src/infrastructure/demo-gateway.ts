import type { Campaign, Channel, ClubMember, Communication, ClubEvent, JourneyStage, Opportunity, Partnership, ProfessionalProfile, Proposal, ProposalFields, SegmentId } from '../domain/types.ts';
import { DomainError } from '../domain/types.ts';
import { draftFromOpportunity, stableDraftHash, validateProposalFields } from '../domain/proposal.ts';
import { validateEligibility } from '../domain/policies.ts';
import { scheduleCommunication, transitionMessage } from '../domain/communication.ts';
import { confirmAcceptance } from '../domain/partnership.ts';
import { createMember } from '../domain/journey.ts';
import { createEvent } from '../domain/event.ts';
import { createCampaign, transitionCampaign } from '../domain/campaign.ts';
import { demoRepository } from './demo-repository.ts';
import { DEMO_USER } from './fixtures.ts';
/** Porta de aplicação com comportamento mock. Trocar pela implementação HTTP após auditoria da API real. */
export interface KawaiiGateway {
  listOpportunities(): Promise<Opportunity[]>;
  createDraft(matchRef: string, idempotencyKey: string): Promise<Proposal>;
  updateDraft(id: number, version: number, fields: ProposalFields, review?: boolean): Promise<Proposal>;
  listProposals(): Promise<Proposal[]>;
  listMembers(): Promise<ClubMember[]>;
  listMessages(): Promise<Communication[]>;
  listEvents(): Promise<ClubEvent[]>;
  scheduleMessage(memberId: number, template: string, channel?: Channel): Promise<Communication>;
  processMessage(id: string, fail?: boolean): Promise<Communication>;
  cancelMessage(id: string): Promise<Communication>;
  retryMessage(id: string): Promise<Communication>;
  registerAttendance(eventId: string, memberId: number): Promise<ClubEvent>;
  listSaved(): Promise<string[]>;
  toggleSaved(matchRef: string): Promise<boolean>;
  dismissOpportunity(matchRef: string): Promise<void>;
  listPartnerships(): Promise<Partnership[]>;
  acceptPartnership(id: string): Promise<Partnership>;
  getProfile(): Promise<ProfessionalProfile>;
  saveProfile(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  listFlows(): Promise<Record<JourneyStage, boolean>>;
  setFlowActive(stage: JourneyStage, active: boolean): Promise<void>;
  addMember(input: { name: string; area: string; whatsappConsent: boolean; emailConsent: boolean }): Promise<ClubMember>;
  createEvent(input: { title: string; date: string; format: ClubEvent['format']; capacity: number }): Promise<ClubEvent>;
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(input: { title: string; message: string; segment: SegmentId; channel: Channel }): Promise<Campaign>;
  processCampaign(id: string, fail?: boolean): Promise<Campaign>;
  resetDemo(): void;
}
const now = () => new Date().toISOString();
const wait = () => new Promise(resolve => setTimeout(resolve, 140));
function track(type: string, entityId: string): void { demoRepository.update(data => { data.telemetry.unshift({ id: crypto.randomUUID(), type, entityId, occurredAt: now() }); }); }
export const demoGateway: KawaiiGateway = {
  async listOpportunities() { await wait(); const data = demoRepository.read(); return structuredClone(data.opportunities.filter(o => !data.dismissed.includes(o.matchRef))); },
  async createDraft(matchRef, idempotencyKey) {
    await wait(); if (!idempotencyKey.trim()) throw new DomainError('INVALID_INPUT', 'Informe a chave de idempotência.');
    const result = demoRepository.update(data => {
      const op = data.opportunities.find(o => o.matchRef === matchRef);
      if (!op) throw new DomainError('NOT_FOUND', 'Match não encontrado.');
      validateEligibility(op, DEMO_USER.id);
      const hash = stableDraftHash(matchRef, DEMO_USER.id);
      const old = data.idempotency[idempotencyKey];
      if (old) {        
if (old.hash !== hash) throw new DomainError('CONFLICT', 'Chave de idempotência reutilizada com outros dados.');
        const draft = data.proposals.find(d => d.id === old.proposalId); if (!draft) throw new DomainError('CONFLICT', 'Referência de rascunho inconsistente.'); return structuredClone(draft);      
}
      const existing = data.proposals.find(p => p.matchRef === matchRef && p.authorId === DEMO_USER.id);
      if (existing) { data.idempotency[idempotencyKey] = { hash, proposalId: existing.id }; return structuredClone(existing); }
      const timestamp = now(); const draft: Proposal = {        
id: data.nextProposalId++, matchRef, opportunityId: op.id,
        authorId: DEMO_USER.id, counterpartyId: op.candidate.id, version: 1, status: 'DRAFT',
        fields: draftFromOpportunity(op), createdAt: timestamp, updatedAt: timestamp      
};
      data.proposals.push(draft); data.idempotency[idempotencyKey] = { hash, proposalId: draft.id }; return structuredClone(draft);
    });
    track('PROPOSAL_DRAFT_OPENED', String(result.id)); return result;
  },
  async updateDraft(id, version, fields, review = false) {
    await wait(); validateProposalFields(fields);
    const result = demoRepository.update(data => {
      const p = data.proposals.find(d => d.id === id); if (!p) throw new DomainError('NOT_FOUND', 'Proposta não encontrada.');
      if (p.authorId !== DEMO_USER.id) throw new DomainError('FORBIDDEN', 'Acesso negado.');
      if (p.version !== version) throw new DomainError('CONFLICT', 'Este rascunho foi alterado em outra sessão. Recarregue.');
      if (p.status !== 'DRAFT' && p.status !== 'READY_FOR_REVIEW') throw new DomainError('CONFLICT', 'Não é permitido editar proposta enviada.');
      p.fields = structuredClone(fields); p.version++; p.status = review ? 'READY_FOR_REVIEW' : 'DRAFT'; p.updatedAt = now(); return structuredClone(p);
    }); track('PROPOSAL_DRAFT_SAVED', String(id)); return result;
  },
  async listProposals() { await wait(); return structuredClone(demoRepository.read().proposals); },
  async listMembers() { await wait(); return structuredClone(demoRepository.read().members); },
  async listMessages() { await wait(); return structuredClone(demoRepository.read().communications); },
  async listEvents() { await wait(); return structuredClone(demoRepository.read().events); },
  async scheduleMessage(memberId, template, channel) {    
await wait(); const result = demoRepository.update(data => {
      const member = data.members.find(m => m.id === memberId); if (!member) throw new DomainError('NOT_FOUND', 'Integrante não encontrada.');
      const message = scheduleCommunication({ member, messages: data.communications, template, now: now(), preferredChannel: channel, id: `msg-${crypto.randomUUID()}` });
      data.communications.unshift(message); return structuredClone(message);
    }); track('MESSAGE_SCHEDULED', result.id); return result;  
},
  async processMessage(id, fail = false) {    
await wait(); const result = demoRepository.update(data => {
      const i = data.communications.findIndex(c => c.id === id); if (i < 0) throw new DomainError('NOT_FOUND', 'Mensagem não encontrada.');
      let msg = transitionMessage(data.communications[i], 'PROCESSING', now());
      // Demonstração: status depende da opção de falha, não da animação da UI.
      msg = transitionMessage(msg, fail ? 'FAILED' : 'SENT', now(), fail ? 'Provedor simulado indisponível.' : undefined);
      data.communications[i] = msg; return structuredClone(msg);
    }); track(fail ? 'MESSAGE_FAILED' : 'MESSAGE_SENT_SIMULATED', id); return result;  
},
  async cancelMessage(id) {    
await wait(); return demoRepository.update(data => {
      const i = data.communications.findIndex(c => c.id === id); if (i < 0) throw new DomainError('NOT_FOUND', 'Mensagem não encontrada.');
      const msg = transitionMessage(data.communications[i], 'CANCELED', now()); data.communications[i] = msg; return structuredClone(msg);
    });  
},
  async retryMessage(id) {    
await wait(); return demoRepository.update(data => {
      const i = data.communications.findIndex(c => c.id === id); if (i < 0) throw new DomainError('NOT_FOUND', 'Mensagem não encontrada.');
      const next = transitionMessage(data.communications[i], 'SCHEDULED', now()); data.communications[i] = next; return structuredClone(next);
    });  
},
  async registerAttendance(eventId, memberId) {    
await wait(); const event = demoRepository.update(data => {
      const event = data.events.find(e => e.id === eventId); if (!event) throw new DomainError('NOT_FOUND', 'Evento não encontrado.');
      if (!data.members.some(m => m.id === memberId)) throw new DomainError('NOT_FOUND', 'Integrante não encontrada.');
      if (event.attendeeIds.includes(memberId)) throw new DomainError('CONFLICT', 'Presença já registrada.');
      event.attendeeIds.push(memberId); return structuredClone(event);
    }); track('EVENT_ATTENDANCE_CONFIRMED', `${eventId}:${memberId}`); return event;  
},
  async listSaved() { await wait(); return [...demoRepository.read().saved]; },
  async toggleSaved(matchRef) {
    return demoRepository.update(data => {
      const on = !data.saved.includes(matchRef);
      data.saved = on ? [...data.saved, matchRef] : data.saved.filter(r => r !== matchRef); return on;
    });
  },
  async dismissOpportunity(matchRef) {
    await wait(); demoRepository.update(data => { if (!data.dismissed.includes(matchRef)) data.dismissed.push(matchRef); data.saved = data.saved.filter(r => r !== matchRef); });
    track('MATCH_DISMISSED', matchRef);
  },
  async listPartnerships() { await wait(); return structuredClone(demoRepository.read().partnerships); },
  async acceptPartnership(id) {
    await wait(); const result = demoRepository.update(data => {
      const i = data.partnerships.findIndex(p => p.id === id); if (i < 0) throw new DomainError('NOT_FOUND', 'Parceria não encontrada.');
      data.partnerships[i] = confirmAcceptance(data.partnerships[i], now().slice(0, 10)); return structuredClone(data.partnerships[i]);
    }); track('PARTNERSHIP_ACCEPTANCE_CONFIRMED', id); return result;
  },
  async getProfile() { await wait(); return structuredClone(demoRepository.read().profile); },
  async saveProfile(profile) {
    await wait(); const result = demoRepository.update(data => { data.profile = structuredClone(profile); return structuredClone(profile); });
    track('PROFILE_UPDATED', String(DEMO_USER.id)); return result;
  },
  async listFlows() { await wait(); return { ...demoRepository.read().flows }; },
  async setFlowActive(stage, active) { await wait(); demoRepository.update(data => { data.flows[stage] = active; }); track(active ? 'FLOW_RESUMED' : 'FLOW_PAUSED', stage); },
  async addMember(input) {
    await wait(); const member = demoRepository.update(data => {
      const id = Math.max(...data.members.map(m => m.id), 99) + 1;
      const m = createMember({ id, ...input }); data.members.unshift(m); return structuredClone(m);
    }); track('MEMBER_ADDED', String(member.id)); return member;
  },
  async createEvent(input) {
    await wait(); return demoRepository.update(data => {
      const e = createEvent({ id: `evt-${crypto.randomUUID().slice(0, 8)}`, ...input }); data.events.push(e); return structuredClone(e);
    });
  },
  async listCampaigns() { await wait(); return structuredClone(demoRepository.read().campaigns); },
  async createCampaign(input) {
    await wait(); const c = demoRepository.update(data => {
      const campaign = createCampaign({ id: `cmp-${crypto.randomUUID().slice(0, 8)}`, ...input, members: data.members, now: now() });
      data.campaigns.unshift(campaign); return structuredClone(campaign);
    }); track('CAMPAIGN_SCHEDULED', c.id); return c;
  },
  async processCampaign(id, fail = false) {
    await wait(); const c = demoRepository.update(data => {
      const i = data.campaigns.findIndex(x => x.id === id); if (i < 0) throw new DomainError('NOT_FOUND', 'Disparo não encontrado.');
      data.campaigns[i] = transitionCampaign(transitionCampaign(data.campaigns[i], 'PROCESSING'), fail ? 'FAILED' : 'SENT'); return structuredClone(data.campaigns[i]);
    }); track(fail ? 'CAMPAIGN_FAILED' : 'CAMPAIGN_SENT_SIMULATED', id); return c;
  },
  resetDemo() { demoRepository.reset(); }
};
