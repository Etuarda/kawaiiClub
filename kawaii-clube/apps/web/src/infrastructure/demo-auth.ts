import type { Role } from '../domain/types.ts';
import { DomainError } from '../domain/types.ts';
export interface DemoSession { role: Role; name: string; business: string; initials: string }
/** Contas fictícias e públicas da demonstração. Não há JWT, hash de senha nem acesso aos sistemas oficiais. */
export const DEMO_ACCOUNTS: (DemoSession & { email: string; password: string; label: string; hint: string })[] = [
  { email: 'vanessa@docesdavanessa.com.br', password: 'kawaii123', role: 'MEMBER', name: 'Vanessa Moreira', business: 'Doces da Vanessa', initials: 'VM', label: 'Empreendedora', hint: 'Vanessa · App de Parcerias' },
  { email: 'equipe@kawaiiclube.com.br', password: 'kawaii123', role: 'ADMIN', name: 'Ellen Kois', business: 'Equipe Kawaii', initials: 'EK', label: 'Equipe Kawaii', hint: 'Ellen Kois · Clube de Conexões' }
];
export async function authenticateDemo(email: string, password: string): Promise<DemoSession> {
  await new Promise(resolve => setTimeout(resolve, 450));
  const account = DEMO_ACCOUNTS.find(a => a.email === email.trim().toLowerCase() && a.password === password);
  if (!account) throw new DomainError('UNAUTHORIZED', 'Email ou senha não conferem. Use uma das contas de demonstração.');
  const { role, name, business, initials } = account;
  return { role, name, business, initials };
}
