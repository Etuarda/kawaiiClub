import type { Opportunity, ProposalFields } from './types.ts';
import { DomainError } from './types.ts';
/** Adapter de referência: traduz oportunidade -> campos do gerador existente (a validar). */
export function draftFromOpportunity(op: Opportunity): ProposalFields {
  const to = op.candidate.name.split(' ')[0];
  if (op.relation === 'COMPANY') return {
    objective: `Atender à oportunidade comercial de ${op.candidate.business}`,
    scope: op.description,
    contribution: 'Serviços ou produtos a entregar conforme os requisitos do projeto.',
    counterpart: 'Pagamento ou condições contratuais a negociar.',
    terms: 'Escopo, preço e condições sujeitos à aprovação das partes.', deadline: op.deadline ?? ''  
};
  if (op.modality === 'EXCHANGE') return {
    objective: `Propor permuta com ${to}`,
    scope: op.description,
    contribution: 'Descrever a entrega que você oferece.', counterpart: 'Descrever a entrega esperada da parceira.',
    terms: 'Definir prazos, responsabilidades e condições de troca.', deadline: op.deadline ?? ''  
};
  if (op.modality === 'SUPPORT') return {
    objective: `Solicitar apoio profissional de ${to}`,
    scope: op.description,
    contribution: 'Contexto e informações necessárias para o apoio.', counterpart: 'Apoio técnico ou orientação solicitada.',
    terms: 'Não exige contrapartida simétrica; condições a combinar.', deadline: op.deadline ?? ''  
};
  return {    
objective: `Criar colaboração com ${to}`, scope: op.description,
    contribution: 'Meu papel e minhas entregas.', counterpart: 'Papel e entregas da parceira.',
    terms: 'Objetivos, responsabilidades e divisão de resultados a combinar.', deadline: op.deadline ?? ''  
};
}
export function validateProposalFields(fields: ProposalFields): void {
  const required: [keyof ProposalFields, string][] = [['objective', 'Objetivo'], ['scope', 'Escopo'], ['contribution', 'Minha contribuição'], ['counterpart', 'Contribuição da parceira']];
  for (const [key, label] of required) if (!fields[key].trim()) throw new DomainError('INVALID_INPUT', `${label} é obrigatório.`);
  if (fields.objective.length > 1000 || fields.scope.length > 5000) throw new DomainError('INVALID_INPUT', 'Texto excede o limite previsto.');
}
export function stableDraftHash(ref: string, authorId: number): string { return `${authorId}:${ref}`; }
