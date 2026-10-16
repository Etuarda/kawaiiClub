import type { Channel, ClubMember, Communication, MessageStatus } from './types.ts';
import { DomainError } from './types.ts';
import { assertCommunicationAllowed, selectChannel } from './policies.ts';
const BILLABLE: MessageStatus[] = ['SCHEDULED', 'PROCESSING', 'SENT', 'DELIVERED'];
export function scheduleCommunication(args: { member: ClubMember; messages: Communication[]; template: string; now: string; preferredChannel?: Channel; id: string }): Communication {
  const { member, messages, template, now, preferredChannel, id } = args;
  const channel = selectChannel(member, preferredChannel);
  const windowStart = new Date(new Date(now).getTime() - 7 * 86400000);
  const recent = messages.filter(m => m.memberId === member.id && BILLABLE.includes(m.status) && new Date(m.scheduledAt) >= windowStart);
  assertCommunicationAllowed(member, recent.length);
  if (messages.some(m => m.memberId === member.id && m.template === template && m.channel === channel && BILLABLE.includes(m.status) && new Date(m.scheduledAt) >= windowStart))
    throw new DomainError('CONFLICT', 'Já existe uma comunicação ativa com este template para a integrante.');
  return { id, memberId: member.id, channel, template, status: 'SCHEDULED', scheduledAt: now, updatedAt: now, attempt: 0 };
}
export function transitionMessage(message: Communication, next: MessageStatus, now: string, error?: string): Communication {
  const transitions: Record<MessageStatus, MessageStatus[]> = { SCHEDULED: ['PROCESSING', 'CANCELED'], PROCESSING: ['SENT', 'FAILED'], SENT: ['DELIVERED', 'FAILED'], DELIVERED: [], FAILED: ['SCHEDULED'], CANCELED: [] };
  if (!transitions[message.status].includes(next)) throw new DomainError('CONFLICT', `Transição ${message.status} → ${next} não permitida.`);
  return { ...message, status: next, updatedAt: now, error, attempt: next === 'PROCESSING' ? message.attempt + 1 : message.attempt };
}
