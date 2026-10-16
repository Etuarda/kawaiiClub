import { demoGateway } from '../../infrastructure/demo-gateway.ts';
import { useDemoResource } from '../../app/useDemoResource.ts';
import { canConfirmAcceptance } from '../../domain/partnership.ts';
import { MODALITY_LABEL } from '../../domain/policies.ts';
export interface PendingItem { key: string; icon: 'pen' | 'id' | 'draft'; tone: 'warn' | 'brand'; title: string; text: string; href: string; cta: string; partnershipId?: string }
/** Ações pendentes da empreendedora (Início e sininho), derivadas só dos dados da demonstração. */
export function usePending(): PendingItem[] {
  const partnerships = useDemoResource(demoGateway.listPartnerships);
  const proposals = useDemoResource(demoGateway.listProposals);
  const profile = useDemoResource(demoGateway.getProfile);
  const opportunities = useDemoResource(demoGateway.listOpportunities);
  const items: PendingItem[] = [];
  partnerships.data?.filter(canConfirmAcceptance).forEach(p => items.push({ key: p.id, icon: 'pen', tone: 'warn', title: 'Revisar contraproposta', text: `De ${p.partner.name} (${p.partner.business})`, href: '/app/propostas', cta: 'Ver detalhes', partnershipId: p.id }));
  const company = opportunities.data?.find(o => o.relation === 'COMPANY');
  if (profile.data && !profile.data.invoice.trim() && company) items.push({ key: 'invoice', icon: 'id', tone: 'brand', title: 'Informe como emite nota fiscal', text: `Empresas como ${company.candidate.business} costumam exigir.`, href: '/app/perfil', cta: 'Editar perfil' });
  proposals.data?.filter(p => p.status === 'DRAFT').forEach(p => {
    const op = opportunities.data?.find(o => o.matchRef === p.matchRef);
    items.push({ key: `d${p.id}`, icon: 'draft', tone: 'warn', title: `Continuar rascunho${op ? ` para ${op.candidate.name.split(' ')[0]}` : ''}`, text: `Versão ${p.version}${op ? ` · ${MODALITY_LABEL[op.modality].toLowerCase()}` : ''}`, href: `/app/propostas/${p.id}`, cta: 'Continuar' });
  });
  return items;
}
