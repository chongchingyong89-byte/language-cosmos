// Hypothesised personality tilt per language, built from its leaves.
// score = Σ (trait direction × evidence weight); norm rescales every score by
// the largest absolute score in the whole universe, so tilts are comparable
// between languages. It is an aggregate of hypotheses, not a measurement.
import { TRAITS, EVIDENCE } from './data/taxonomy.js';

export function buildProfiles(languages, itemsFor) {
  const profiles = new Map();
  let max = 0;
  for (const lang of languages) {
    const p = Object.fromEntries(Object.keys(TRAITS).map((t) => [t, { score: 0, mass: 0, from: [] }]));
    for (const item of itemsFor(lang)) {
      const w = (EVIDENCE[item.evidence] ?? EVIDENCE.speculative).w;
      for (const [t, dir] of Object.entries(item.traits ?? {})) {
        p[t].score += dir * w;
        p[t].mass += Math.abs(dir) * w;
        p[t].from.push({ item, dir });
      }
    }
    for (const t of Object.values(p)) max = Math.max(max, Math.abs(t.score));
    profiles.set(lang.id, p);
  }
  for (const p of profiles.values()) for (const t of Object.values(p)) t.norm = max ? t.score / max : 0;
  return profiles;
}
