import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { MatchInput, ProposalDraft, ProposalFields, Recommendation } from './contracts';
/** In-memory para prova técnica. Substituir por adaptadores do matching/gerador reais e Prisma. */
@Injectable()
export class DemoBusinessService {
  private readonly recs: Recommendation[] = [
    { matchRef: 'op204:c15:v1', opportunityId: 204, candidate: { id: 15, displayName: 'Bruna Teixeira', type: 'ENTREPRENEUR' }, modality: 'EXCHANGE', relation: 'PEER', explanation: 'Fotografia e confeitaria se complementam.', evidence: [{ criterion: 'Serviço', sourceType: 'PROFILE', sourceRef: 'fixture-profile-15', confirmed: true }], policyVersion: 'v1', evaluatedAt: '2026-10-15T09:00:00Z' },
    { matchRef: 'op410:c30:v1', opportunityId: 410, candidate: { id: 30, displayName: 'Empório Vila Nova', type: 'COMPANY' }, modality: 'COLLAB', relation: 'COMPANY', explanation: 'Oferta de doces atende a uma demanda comercial.', evidence: [{ criterion: 'Categoria', sourceType: 'OPPORTUNITY', sourceRef: 'fixture-op-410', confirmed: true }], policyVersion: 'v1', evaluatedAt: '2026-10-15T09:00:00Z' }
  ];
  private readonly drafts = new Map<number, ProposalDraft>();
  private readonly idempotency = new Map<string, { hash: string; draftId: number }>();
  private nextId = 501;
  recommendations(opportunityId: number) { return this.recs.filter(r => r.opportunityId === opportunityId); }
  getDraft(id: number) { const draft = this.drafts.get(id); if (!draft) throw new NotFoundException('Rascunho não encontrado.'); return draft; }
  createDraft(input: MatchInput, key: string) {
    if (!key || key.length < 8) throw new BadRequestException('Idempotency-Key obrigatório (mínimo 8 caracteres).');
    const rec = this.recs.find(r => r.matchRef === input.matchRef); if (!rec) throw new NotFoundException('Match não encontrado.');
    if (input.expectedPolicyVersion !== rec.policyVersion) throw new ConflictException('Política de matching foi alterada.');
    const hash = `${input.matchRef}:${input.expectedPolicyVersion}`; const prev = this.idempotency.get(key);
    if (prev) { if (prev.hash !== hash) throw new ConflictException('Chave reutilizada com outra intenção.'); return this.getDraft(prev.draftId); }
    const existing = [...this.drafts.values()].find(d => d.matchRef === input.matchRef);
    if (existing) { this.idempotency.set(key, { hash, draftId: existing.id }); return existing; }
    const timestamp = new Date().toISOString(); const draft: ProposalDraft = { id: this.nextId++, matchRef: rec.matchRef, opportunityId: rec.opportunityId, version: 1, status: 'DRAFT', fields: { objective: `Proposta de parceria com ${rec.candidate.displayName}`, scope: 'Descrever a proposta e as entregas necessárias.' }, createdAt: timestamp, updatedAt: timestamp };
    this.drafts.set(draft.id, draft); this.idempotency.set(key, { hash, draftId: draft.id }); return draft;
  }
  updateDraft(id: number, input: { expectedVersion: number; fields: ProposalFields }) {
    const draft = this.getDraft(id);
    if (draft.version !== input.expectedVersion) throw new ConflictException('Versão divergente.');
    if (!input.fields.objective?.trim() || !input.fields.scope?.trim()) throw new BadRequestException('Objetivo e escopo são obrigatórios.');
    const updated: ProposalDraft = { ...draft, version: draft.version + 1, fields: input.fields, updatedAt: new Date().toISOString() };
    this.drafts.set(id, updated); return updated;
  }
}
