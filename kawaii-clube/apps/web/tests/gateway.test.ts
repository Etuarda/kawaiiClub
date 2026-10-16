import test from 'node:test';
import assert from 'node:assert/strict';
import { demoGateway } from '../src/infrastructure/demo-gateway.ts';
import { demoRepository } from '../src/infrastructure/demo-repository.ts';

// Isolamento: dados inteiramente fictícios e persistência somente neste processo de teste.
const stored = new Map<string, string>();
const storage = {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => { stored.set(key, value); },
  removeItem: (key: string) => { stored.delete(key); },
  clear: () => { stored.clear(); },
  key: (index: number) => [...stored.keys()][index] ?? null,
  get length() { return stored.size; }
};
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });

test('integração demonstrativa: criar o mesmo rascunho é idempotente', async () => {
  demoRepository.reset();
  const opportunity = (await demoGateway.listOpportunities())[0];
  const first = await demoGateway.createDraft(opportunity.matchRef, 'proposal-demo-100');
  const second = await demoGateway.createDraft(opportunity.matchRef, 'proposal-demo-100');
  assert.equal(first.id, second.id);
  assert.equal((await demoGateway.listProposals()).filter(p => p.matchRef === opportunity.matchRef).length, 1);
});

test('integração demonstrativa: reutilizar chave com outra intenção gera conflito', async () => {
  demoRepository.reset();
  const opportunities = await demoGateway.listOpportunities();
  await demoGateway.createDraft(opportunities[0].matchRef, 'proposal-demo-200');
  await assert.rejects(
    () => demoGateway.createDraft(opportunities[1].matchRef, 'proposal-demo-200'),
    /Chave de idempotência reutilizada/
  );
});

test('integração demonstrativa: controle otimista impede edição obsoleta', async () => {
  demoRepository.reset();
  const opportunity = (await demoGateway.listOpportunities())[0];
  const draft = await demoGateway.createDraft(opportunity.matchRef, 'proposal-demo-300');
  const updated = await demoGateway.updateDraft(draft.id, draft.version, { ...draft.fields, objective: 'Escopo atualizado' });
  assert.equal(updated.version, draft.version + 1);
  await assert.rejects(
    () => demoGateway.updateDraft(draft.id, draft.version, draft.fields),
    /alterado em outra sessão/
  );
});

test('integração demonstrativa: mensagem não autorizada nunca é agendada', async () => {
  demoRepository.reset();
  const members = await demoGateway.listMembers();
  const member = members.find(m => !m.emailConsent && !m.whatsappConsent);
  assert.ok(member, 'Fixture deve conter integrante sem canal autorizado');
  const before = (await demoGateway.listMessages()).length;
  await assert.rejects(() => demoGateway.scheduleMessage(member.id, 'Boas-vindas'), /não autorizou/);
  assert.equal((await demoGateway.listMessages()).length, before);
});

test('integração demonstrativa: a presença duplicada é bloqueada', async () => {
  demoRepository.reset();
  const event = (await demoGateway.listEvents())[0];
  const member = (await demoGateway.listMembers()).find(m => !event.attendeeIds.includes(m.id));
  assert.ok(member, 'Fixture precisa permitir novo check-in');
  const after = await demoGateway.registerAttendance(event.id, member.id);
  assert.ok(after.attendeeIds.includes(member.id));
  await assert.rejects(() => demoGateway.registerAttendance(event.id, member.id), /já registrada/);
});

test('integração demonstrativa: ocultar oportunidade remove da lista e dos salvos', async () => {
  demoRepository.reset();
  const op = (await demoGateway.listOpportunities())[0];
  assert.equal(await demoGateway.toggleSaved(op.matchRef), true);
  await demoGateway.dismissOpportunity(op.matchRef);
  assert.ok(!(await demoGateway.listOpportunities()).some(o => o.matchRef === op.matchRef));
  assert.ok(!(await demoGateway.listSaved()).includes(op.matchRef));
});

test('integração demonstrativa: aceite bilateral fica persistido', async () => {
  demoRepository.reset();
  const p = (await demoGateway.listPartnerships()).find(x => x.status === 'NEGOTIATING');
  assert.ok(p);
  const accepted = await demoGateway.acceptPartnership(p.id);
  assert.equal(accepted.status, 'ACCEPTED');
  await assert.rejects(() => demoGateway.acceptPartnership(p.id), /não aguarda/);
});

test('integração demonstrativa: disparo agendado só avança ao processar', async () => {
  demoRepository.reset();
  const c = await demoGateway.createCampaign({ title: 'Aviso', message: 'Texto', segment: 'event', channel: 'WHATSAPP' });
  assert.equal(c.status, 'SCHEDULED');
  assert.equal((await demoGateway.processCampaign(c.id)).status, 'SENT');
  await assert.rejects(() => demoGateway.processCampaign(c.id), /não permitida/);
});
