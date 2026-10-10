import { Cosmos } from './cosmos.js';
import { UI } from './ui.js';
import { SoundScape } from './audio.js';
import { LANGUAGES, AGENCY } from './data/languages.js';
import { FEATURES, BRIDGES } from './data/features.js';

// Catch data typos early: unknown feature ids or bridge endpoints.
const ids = new Set(LANGUAGES.map((l) => l.id));
for (const l of LANGUAGES) {
  for (const f of l.features) if (!FEATURES[f]) console.warn(`[cosmos] ${l.id}: unknown feature "${f}"`);
}
for (const b of BRIDGES) {
  if (!ids.has(b.a) || !ids.has(b.b)) console.warn(`[cosmos] bridge ${b.a}–${b.b}: unknown language`);
}

const data = { languages: LANGUAGES, features: FEATURES, bridges: BRIDGES, agency: AGENCY };
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
