import type { DemoData } from '../domain/types.ts';
import { seedData } from './fixtures.ts';
/** Repositório de demonstração: navegador/localStorage, nunca banco de produção. */
const STORAGE_KEY = 'kawaii-challenge-demo-v1';
const listeners = new Set<() => void>();
let state: DemoData | undefined;
function load(): DemoData {
  if (state) return state;
  // Dados salvos por versões anteriores recebem os campos novos do seed, sem perder o que já existia.
  try { const raw = localStorage.getItem(STORAGE_KEY); state = raw ? { ...seedData(), ...JSON.parse(raw) as Partial<DemoData> } : seedData(); }
  catch { state = seedData(); }
  return state;
}
export const demoRepository = {
  read: (): DemoData => load(),
  update<T>(action: (data: DemoData) => T): T {
    const previous = structuredClone(load());
    try { const result = action(load()); localStorage.setItem(STORAGE_KEY, JSON.stringify(load())); listeners.forEach(fn => fn()); return result; }
    catch (error) { state = previous; throw error; }
  },
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  reset() { state = seedData(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {/* armazenamento bloqueado */ } listeners.forEach(fn => fn()); }
};
