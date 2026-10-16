import type { ClubEvent } from './types.ts';
import { DomainError } from './types.ts';
export function createEvent(input: { id: string; title: string; date: string; format: ClubEvent['format']; capacity: number }): ClubEvent {
  const title = input.title.trim();
  if (!title || !input.date) throw new DomainError('INVALID_INPUT', 'Informe nome e data do evento.');
  if (!Number.isInteger(input.capacity) || input.capacity < 1) throw new DomainError('INVALID_INPUT', 'Informe a quantidade de vagas.');
  return { id: input.id, title, date: input.date, format: input.format, capacity: input.capacity, enrolled: 0, confirmed: 0, attendeeIds: [] };
}
export function remainingSeats(e: ClubEvent): number | null { return e.capacity == null ? null : Math.max(0, e.capacity - e.confirmed); }
