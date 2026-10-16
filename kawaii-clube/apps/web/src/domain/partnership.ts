import type { Partnership } from './types.ts';
import { DomainError } from './types.ts';
/** A participante só confirma o próprio aceite quando a negociação aguarda a resposta dela. */
export function canConfirmAcceptance(p: Partnership): boolean { return p.status === 'NEGOTIATING' && !p.myAcceptance; }
/** Aceite bilateral: o status só vira ACCEPTED com as duas confirmações. Aceitar não comprova entrega. */
export function confirmAcceptance(p: Partnership, today: string): Partnership {
  if (!canConfirmAcceptance(p)) throw new DomainError('CONFLICT', 'Esta parceria não aguarda o seu aceite.');
  const both = p.theirAcceptance;
  const entry = both
    ? { date: today, title: 'Aceite das duas partes', detail: 'A parceria foi aceita. Próximo passo: combinar e confirmar a entrega.' }
    : { date: today, title: 'Seu aceite registrado', detail: 'Aguardando a confirmação da outra parte.' };
  return { ...p, myAcceptance: true, status: both ? 'ACCEPTED' : p.status, history: [entry, ...p.history] };
}
