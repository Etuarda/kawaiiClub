import type { ProfessionalProfile } from './types.ts';
const TEXT_FIELDS: (keyof ProfessionalProfile)[] = ['area', 'offers', 'needs', 'goals', 'audience', 'invoice'];
/** Completude do perfil (0–100). Indica qualidade dos dados para o match, não chance de sucesso. */
export function profileCompleteness(profile: ProfessionalProfile): number {
  const filled = TEXT_FIELDS.filter(key => String(profile[key] ?? '').trim()).length + (profile.modalities.length ? 1 : 0);
  return Math.round(filled / (TEXT_FIELDS.length + 1) * 100);
}
