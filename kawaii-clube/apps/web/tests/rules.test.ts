import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMBERS, PARTNERSHIPS, PROFILE } from '../src/infrastructure/fixtures.ts';
import { canConfirmAcceptance, confirmAcceptance } from '../src/domain/partnership.ts';
import { profileCompleteness } from '../src/domain/profile.ts';
import { campaignReach, createCampaign, transitionCampaign } from '../src/domain/campaign.ts';
import { createMember, engagementLevel } from '../src/domain/journey.ts';
import { createEvent, remainingSeats } from '../src/domain/event.ts';
const now = '2026-10-16T10:00:00.000Z';
const negotiating = PARTNERSHIPS.find(p => p.status === 'NEGOTIATING')!;
const waiting = PARTNERSHIPS.find(p => p.status === 'SENT')!;

test('aceite só vira ACCEPTED com as duas partes', () => {
  assert.equal(confirmAcceptance(negotiating, '2026-10-16').status, 'ACCEPTED');
  const onlyMine = confirmAcceptance({ ...negotiating, theirAcceptance: false }, '2026-10-16');
  assert.equal(onlyMine.status, 'NEGOTIATING'); assert.equal(onlyMine.myAcceptance, true);
});
test('não confirma aceite de proposta que aguarda a outra parte', () => {
  assert.equal(canConfirmAcceptance(waiting), false);
  assert.throws(() => confirmAcceptance(waiting, '2026-10-16'), /não aguarda/);
});
test('completude do perfil sobe ao informar nota fiscal', () => {
  const before = profileCompleteness(PROFILE), after = profileCompleteness({ ...PROFILE, invoice: 'MEI ativo' });
  assert.ok(after > before); assert.equal(after, 100);
  assert.equal(profileCompleteness({ ...PROFILE, area: '', offers: '', needs: '', goals: '', audience: '', invoice: '', modalities: [] }), 0);
});
test('alcance do disparo exclui quem não autorizou o canal', () => {
  const r = campaignReach(MEMBERS, 'active', 'EMAIL');
  assert.ok(r.reachable < r.total);
  const c = createCampaign({ id: 'c', title: 'Aviso', message: 'Texto', segment: 'active', channel: 'EMAIL', members: MEMBERS, now });
  assert.equal(c.audience, r.reachable); assert.equal(c.excluded, r.total - r.reachable);
});
test('disparo sem ninguém autorizado é bloqueado', () => {
  const noConsent = MEMBERS.map(m => ({ ...m, whatsappConsent: false }));
  assert.throws(() => createCampaign({ id: 'c', title: 'Aviso', message: 'Texto', segment: 'active', channel: 'WHATSAPP', members: noConsent, now }), /autorizou/);
});
test('disparo não pula o processamento nem presume entrega', () => {
  const c = createCampaign({ id: 'c', title: 'Aviso', message: 'Texto', segment: 'active', channel: 'EMAIL', members: MEMBERS, now });
  assert.throws(() => transitionCampaign(c, 'SENT'), /não permitida/);
  assert.equal(transitionCampaign(transitionCampaign(c, 'PROCESSING'), 'SENT').status, 'SENT');
});
test('nova integrante começa no cadastro e exige nome e área', () => {
  const m = createMember({ id: 101, name: ' Ana Dias ', area: 'Doces', whatsappConsent: false, emailConsent: true });
  assert.equal(m.stage, 'joined'); assert.equal(m.name, 'Ana Dias'); assert.equal(m.engagementScore, 0);
  assert.throws(() => createMember({ id: 102, name: '', area: 'x', whatsappConsent: true, emailConsent: true }), /nome/);
  assert.equal(engagementLevel(m.engagementScore).label, 'Baixa atividade');
});
test('evento exige vagas e calcula as restantes', () => {
  assert.throws(() => createEvent({ id: 'e', title: 'Roda', date: '2026-11-01', format: 'ONLINE', capacity: 0 }), /vagas/);
  const e = createEvent({ id: 'e', title: 'Roda', date: '2026-11-01', format: 'ONLINE', capacity: 10 });
  assert.equal(remainingSeats({ ...e, confirmed: 12 }), 0);
});
