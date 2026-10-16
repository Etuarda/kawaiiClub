import type { ClubMember, DemoData, Opportunity, Partnership, Participant, ProfessionalProfile } from '../domain/types.ts';
const person = (id: number, name: string, business: string, expertise: string, location: string, offered: string[], needs: string[]): Participant => ({ id, name, business, expertise, initials: name.split(' ').map(s => s[0]).slice(0, 2).join(''), location, offered, needs });
const bruna = person(15, 'Bruna Teixeira', 'Bruna Foto', 'Fotografia de produtos', 'Itaquera, SP', ['Fotos para cardápio', 'Tratamento de imagens'], ['Doces para cenários', 'Parceira para ensaios']);
const rosana = person(16, 'Rosana Lima', 'Rosana Finanças', 'Consultoria e precificação', 'Guaianases, SP', ['Mentoria de precificação', 'Planilha de custo'], ['Experiências de clientes']);
const tatiane = person(18, 'Tatiane Ribeiro', 'Ateliê Tati', 'Artesanato em tecido', 'São Mateus, SP', ['Embalagens artesanais', 'Feira de negócios'], ['Doces finos para kits']);
const empresa = person(30, 'Equipe Empório Vila Nova', 'Empório Vila Nova', 'Comércio e fornecimento', 'Penha, SP', ['Compra corporativa'], ['Fornecimento de doces finos']);
export const DEMO_USER = { id: 14, name: 'Vanessa Moreira', business: 'Doces da Vanessa', initials: 'VM' };
export const OPPORTUNITIES: Opportunity[] = [
  {    
id: 204, matchRef: 'op204:c15:v1', creatorId: 14, status: 'ACTIVE', modality: 'EXCHANGE', relation: 'PEER', policyVersion: 'v1', candidate: bruna,
    title: 'Bolos para eventos em troca de fotografias profissionais', description: 'Preciso de fotos para o cardápio e ofereço bolos decorados para os ensaios.', explanation: 'A fotógrafa oferece as imagens de que você precisa e tem demanda por doces para cenários.', deadline: '2026-11-30',
    evidence: [{ criterion: 'Serviço necessário', detail: 'Fotografia profissional de produtos está entre os serviços oferecidos.', source: 'Perfil da parceira', status: 'confirmed' },
    { criterion: 'Contrapartida compatível', detail: 'Bolos decorados atendem ao interesse em cenários de ensaio.', source: 'Necessidades declaradas', status: 'confirmed' },
    { criterion: 'Região', detail: 'Ambas atendem a Zona Leste de São Paulo.', source: 'Dados de perfil', status: 'confirmed' }]  
},
  {    
id: 205, matchRef: 'op205:c16:v1', creatorId: 14, status: 'ACTIVE', modality: 'SUPPORT', relation: 'PEER', policyVersion: 'v1', candidate: rosana,
    title: 'Mentoria para melhorar a precificação dos meus doces', description: 'Preciso definir custo, margem e preço de produtos feitos por encomenda.', explanation: 'Rosana possui competência em precificação e oferece apoio a pequenos negócios.',
    evidence: [{ criterion: 'Competência específica', detail: 'Precificação e fluxo de caixa para MEI.', source: 'Perfil profissional', status: 'confirmed' },
    { criterion: 'Disponibilidade de apoio', detail: 'Mentoria anunciada no mural.', source: 'Oportunidade cadastrada', status: 'confirmed' }]  
},
  {    
id: 312, matchRef: 'op312:c18:v1', creatorId: 14, status: 'ACTIVE', modality: 'COLLAB', relation: 'PEER', policyVersion: 'v1', candidate: tatiane,
    title: 'Kits de presente para vender juntas na feira', description: 'Criar kits com doces e embalagens artesanais para um evento de fim de ano.', explanation: 'As duas empreendedoras oferecem recursos complementares para um produto conjunto.', deadline: '2026-12-05',
    evidence: [{ criterion: 'Objetivo compartilhado', detail: 'Produzir e vender kits na feira.', source: 'Oportunidade no mural', status: 'confirmed' },
    { criterion: 'Competências complementares', detail: 'Doces e embalagens artesanais.', source: 'Perfis', status: 'confirmed' },
    { criterion: 'Volume de produção', detail: 'A capacidade para 40 kits ainda precisa ser confirmada.', source: 'Dados declarados', status: 'inferred' }]  
},
  {    
id: 410, matchRef: 'op410:c30:v1', creatorId: 14, status: 'ACTIVE', modality: 'COLLAB', relation: 'COMPANY', policyVersion: 'v1', candidate: empresa,
    title: 'Empório busca fornecedora de doces finos para cestas', description: 'Fornecimento de 80 caixas com seis doces finos para kits corporativos.', explanation: 'Sua produção é pertinente à demanda da empresa; prazo e capacidade devem ser confirmados.', deadline: '2026-12-12',
    evidence: [{ criterion: 'Aderência comercial', detail: 'O empório busca os mesmos produtos que você oferece.', source: 'Oportunidade empresarial', status: 'confirmed' },
    { criterion: 'Localização', detail: 'Entrega na Zona Leste de São Paulo.', source: 'Requisitos publicados', status: 'confirmed' },
    { criterion: 'Capacidade de entrega', detail: 'Ainda não foi confirmada a produção de 80 caixas.', source: 'Requisito da oportunidade', status: 'inferred' }]  
}
];
const makeMember = (id: number, name: string, area: string, stage: ClubMember['stage'], whatsappConsent: boolean, emailConsent: boolean, engagementScore: number, lastActivity: string): ClubMember => ({ id, name, area, stage, whatsappConsent, emailConsent, engagementScore, lastActivity, phoneMasked: '(11) *****-**' + String(id).padStart(2, '0'), emailMasked: '***@exemplo.com' });
export const MEMBERS: ClubMember[] = [
  makeMember(14, 'Vanessa Moreira', 'Confeitaria', 'opportunity', true, true, 55, 'Hoje'),
  makeMember(15, 'Bruna Teixeira', 'Fotografia', 'opportunity', true, true, 62, 'Ontem'),
  makeMember(16, 'Rosana Lima', 'Finanças para MEI', 'opportunity', true, false, 48, 'Há 2 dias'),
  makeMember(18, 'Tatiane Ribeiro', 'Artesanato', 'event', true, true, 22, 'Há 4 dias'),
  makeMember(21, 'Cláudia Santos', 'Estética', 'profile', true, true, 12, 'Há 6 dias'),
  makeMember(22, 'Joana Prado', 'Moda autoral', 'profile', false, true, 8, 'Há 9 dias'),
  makeMember(23, 'Luciana Alves', 'Marmitas', 'welcome', true, true, 5, 'Hoje'),
  makeMember(24, 'Priscila Melo', 'Design gráfico', 'joined', true, true, 0, 'Hoje'),
  makeMember(25, 'Rita Campos', 'Costura', 'event', true, false, 15, 'Há 3 dias'),
  makeMember(26, 'Sueli Nunes', 'Cosméticos naturais', 'opportunity', false, false, 3, 'Há 21 dias')
];
export const PARTNERSHIPS: Partnership[] = [
  { id: 'p-12', partner: { name: 'Joana Prado', business: 'Joana Autoral', initials: 'JP' }, objective: 'Vitrine conjunta na feira de moda autoral', modality: 'COLLAB', status: 'NEGOTIATING', date: '2026-10-12', myAcceptance: false, theirAcceptance: true,
    history: [{ date: '2026-10-12', title: 'Contraproposta recebida', detail: 'Joana aceitou o escopo e sugeriu dividir o estande em duas metades.' }, { date: '2026-10-09', title: 'Proposta enviada', detail: 'Você propôs uma vitrine com doces e peças de moda autoral.' }, { date: '2026-10-07', title: 'Recomendação aceita', detail: 'A conexão começou pela Central de Oportunidades.' }] },
  { id: 'p-11', partner: { name: 'Luciana Alves', business: 'Marmitas da Lu', initials: 'LA' }, objective: 'Sobremesas para as marmitas da semana', modality: 'EXCHANGE', status: 'SENT', date: '2026-10-08', myAcceptance: true, theirAcceptance: false,
    history: [{ date: '2026-10-08', title: 'Proposta enviada', detail: 'Você ofereceu 40 sobremesas por semana em troca de divulgação para a base de clientes dela.' }, { date: '2026-10-06', title: 'Recomendação aceita', detail: 'A conexão começou pela Central de Oportunidades.' }] }
];
export const PROFILE: ProfessionalProfile = {
  area: 'Confeitaria artesanal', offers: 'Bolos decorados, doces finos e mesas para eventos. Produzo até 100 unidades por semana.',
  needs: 'Fotografia de produtos, precificação e oportunidades comerciais.', goals: 'Vender mais para empresas no fim de ano e melhorar as fotos do cardápio.',
  audience: 'Famílias da Zona Leste e pequenas empresas que montam cestas e eventos.', modalities: ['EXCHANGE', 'SUPPORT', 'COLLAB'], relations: ['PEER', 'COMPANY'],
  availability: 'Moderada, de 5 a 10 horas por semana', invoice: '', whatsapp: true, email: true
};
const t = '2026-10-16T09:00:00.000Z';
export function seedData(): DemoData {  
return {
    opportunities: structuredClone(OPPORTUNITIES), proposals: [], members: structuredClone(MEMBERS),
    communications: [
      { id: 'msg-01', memberId: 23, channel: 'WHATSAPP', template: 'Boas-vindas', status: 'DELIVERED', scheduledAt: '2026-10-15T09:00:00.000Z', updatedAt: t, attempt: 1 },
      { id: 'msg-02', memberId: 23, channel: 'EMAIL', template: 'Guia inicial', status: 'SENT', scheduledAt: '2026-10-15T10:00:00.000Z', updatedAt: t, attempt: 1 },
      { id: 'msg-03', memberId: 21, channel: 'WHATSAPP', template: 'Completar perfil', status: 'FAILED', scheduledAt: '2026-10-15T11:00:00.000Z', updatedAt: t, attempt: 1, error: 'Falha simulada do provedor' },
      { id: 'msg-04', memberId: 18, channel: 'EMAIL', template: 'Convite de evento', status: 'SCHEDULED', scheduledAt: '2026-10-17T09:00:00.000Z', updatedAt: t, attempt: 0 }
    ],
    events: [
      { id: 'evt-1', title: 'Roda de precificação', date: '2026-10-09', format: 'ONLINE', enrolled: 22, confirmed: 17, attendeeIds: [14, 15, 16, 18, 21], capacity: 25 },
      { id: 'evt-2', title: 'Encontro de boas-vindas', date: '2026-10-22', format: 'ONLINE', enrolled: 18, confirmed: 14, attendeeIds: [], capacity: 30 },
      { id: 'evt-3', title: 'Feira da Praça', date: '2026-12-06', format: 'PRESENCIAL', enrolled: 9, confirmed: 6, attendeeIds: [], capacity: 15 }
    ], telemetry: [], idempotency: {}, nextProposalId: 501,
    saved: [], dismissed: [], partnerships: structuredClone(PARTNERSHIPS), profile: structuredClone(PROFILE),
    flows: { joined: true, welcome: true, profile: true, event: true, opportunity: true },
    campaigns: [{ id: 'cmp-1', title: 'Destaques da semana e novas oportunidades', message: 'Resumo semanal do Clube.', segment: 'active', channel: 'EMAIL', audience: 4, excluded: 2, status: 'SENT', createdAt: '2026-10-14T12:00:00.000Z' }]  
};
}
