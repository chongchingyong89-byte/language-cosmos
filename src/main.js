import { Cosmos } from './cosmos.js';
import { UI } from './ui.js';
import { SoundScape } from './audio.js';
import { LANGUAGES, AGENCY } from './data/languages.js';
import { FEATURES, BRIDGES } from './data/features.js';
import { FEATURE_SHADOWS, CONCEPT_SHADOWS, BRIDGE_SHADOWS } from './data/shadows.js';

// Catch data typos early: unknown feature ids or bridge endpoints.
const ids = new Set(LANGUAGES.map((l) => l.id));
for (const l of LANGUAGES) {
  for (const f of l.features) if (!FEATURES[f]) console.warn(`[cosmos] ${l.id}: unknown feature "${f}"`);
}
for (const b of BRIDGES) {
  if (!ids.has(b.a) || !ids.has(b.b)) console.warn(`[cosmos] bridge ${b.a}–${b.b}: unknown language`);
}
const terms = new Set(LANGUAGES.flatMap((l) => l.concepts.map((c) => c.term)));
for (const k of Object.keys(FEATURE_SHADOWS)) if (!FEATURES[k] && !AGENCY[k]) console.warn(`[cosmos] shadow for unknown feature "${k}"`);
for (const k of Object.keys(CONCEPT_SHADOWS)) if (!terms.has(k)) console.warn(`[cosmos] shadow for unknown concept "${k}"`);
for (const k of Object.keys(BRIDGE_SHADOWS)) if (!BRIDGES.some((b) => b.title === k)) console.warn(`[cosmos] shadow for unknown bridge "${k}"`);

const shadows = { features: FEATURE_SHADOWS, concepts: CONCEPT_SHADOWS, bridges: BRIDGE_SHADOWS };
const data = { languages: LANGUAGES, features: FEATURES, bridges: BRIDGES, agency: AGENCY, shadows };
try {
  const cosmos = new Cosmos(document.getElementById('scene'), data);
  new UI(cosmos, data, new SoundScape());
  window.cosmos = cosmos; // handy for poking at it from the devtools console
} catch (err) {
  console.error(err);
  document.getElementById('loading').textContent = `Could not start the 3D view: ${err.message}`;
  throw err;
}
document.getElementById('loading').remove();
