// Tiny chibi characters drawn as SVG, so shops need no image files.
// look = { hair, style: long|bob|short|bun|spiky, outfit, legs, skin, acc: [...] }
// acc: tie, randoseru, cane, umbrella, backpack, glasses, cap

const SKIN = '#f6d5b8';

function hairBack(style, c) {
  if (style === 'long') return `<path d="M22 40 Q22 12 50 12 Q78 12 78 40 L80 92 Q66 98 50 96 Q34 98 20 92Z" fill="${c}"/>`;
  if (style === 'bob') return `<path d="M23 42 Q22 12 50 12 Q78 12 77 42 L78 66 Q50 74 22 66Z" fill="${c}"/>`;
  return '';
}

function hairFront(style, c) {
  switch (style) {
    case 'bun':
      return `<circle cx="50" cy="12" r="10" fill="${c}"/><path d="M24 40 Q24 14 50 14 Q76 14 76 40 Q66 26 50 27 Q34 26 24 40Z" fill="${c}"/>`;
    case 'short':
      return `<path d="M23 40 Q22 12 50 12 Q78 12 77 40 Q72 30 62 29 Q50 22 38 29 Q28 30 23 40Z" fill="${c}"/>`;
    case 'spiky':
      return `<path d="M22 40 L26 18 L34 24 L40 10 L48 22 L56 9 L62 22 L70 14 L74 26 L78 40 Q66 28 50 28 Q34 28 22 40Z" fill="${c}"/>`;
    default: // long / bob: fringe
      return `<path d="M24 40 Q24 14 50 14 Q76 14 76 40 Q70 28 60 30 Q54 24 46 30 Q34 26 24 40Z" fill="${c}"/>`;
  }
}

export function chibi(look, { mood = 'smile' } = {}) {
  const { hair = '#2b1d14', style = 'short', outfit = '#3b6fd6', legs = '#24293b', skin = SKIN, acc = [] } = look;
  const has = (a) => acc.includes(a);
  const mouth = mood === 'wow'
    ? '<ellipse cx="50" cy="55" rx="3" ry="3.6" fill="#7a2f2f"/>'
    : mood === 'sad' ? '<path d="M45 57 Q50 53 55 57" stroke="#7a2f2f" stroke-width="2" fill="none" stroke-linecap="round"/>'
      : '<path d="M45 53 Q50 58 55 53" stroke="#7a2f2f" stroke-width="2" fill="none" stroke-linecap="round"/>';
  return `
    ${has('umbrella') ? '<g opacity="0.55"><path d="M8 18 Q50 -16 92 18 Q71 10 50 14 Q29 10 8 18Z" fill="#e8f3ff" stroke="#ffffff" stroke-width="1.2"/><line x1="50" y1="2" x2="50" y2="96" stroke="#dfe7f2" stroke-width="2"/></g>' : ''}
    ${has('randoseru') ? '<rect x="28" y="70" width="44" height="36" rx="8" fill="#d63a3a"/>' : ''}
    ${has('backpack') ? '<rect x="26" y="72" width="48" height="34" rx="9" fill="#4a5c3a"/>' : ''}
    ${hairBack(style, hair)}
    <rect x="42" y="104" width="7" height="24" rx="3" fill="${legs}"/>
    <rect x="51" y="104" width="7" height="24" rx="3" fill="${legs}"/>
    <ellipse cx="45" cy="129" rx="6" ry="3" fill="#1b1b22"/><ellipse cx="55" cy="129" rx="6" ry="3" fill="#1b1b22"/>
    <path d="M32 74 Q50 66 68 74 L72 108 L28 108Z" fill="${outfit}"/>
    <rect x="25" y="76" width="8" height="24" rx="4" fill="${outfit}"/><rect x="67" y="76" width="8" height="24" rx="4" fill="${outfit}"/>
    <circle cx="29" cy="101" r="4" fill="${skin}"/><circle cx="71" cy="101" r="4" fill="${skin}"/>
    ${has('tie') ? '<path d="M50 72 L46 78 L50 98 L54 78Z" fill="#c23b3b"/>' : ''}
    <circle cx="50" cy="44" r="26" fill="${skin}"/>
    <ellipse cx="41" cy="47" rx="3" ry="4" fill="#26222e"/><ellipse cx="59" cy="47" rx="3" ry="4" fill="#26222e"/>
    <circle cx="42" cy="45.5" r="1.1" fill="#fff"/><circle cx="60" cy="45.5" r="1.1" fill="#fff"/>
    <ellipse cx="35" cy="54" rx="4" ry="2.2" fill="#ff9aa8" opacity="0.6"/><ellipse cx="65" cy="54" rx="4" ry="2.2" fill="#ff9aa8" opacity="0.6"/>
    ${mouth}
    ${hairFront(style, hair)}
    ${has('glasses') ? '<g fill="none" stroke="#33333d" stroke-width="1.6"><circle cx="41" cy="47" r="6"/><circle cx="59" cy="47" r="6"/><line x1="47" y1="47" x2="53" y2="47"/></g>' : ''}
    ${has('cap') ? `<path d="M24 32 Q50 6 76 32Z" fill="#e8a33c"/><rect x="60" y="28" width="22" height="5" rx="2" fill="#e8a33c"/>` : ''}
    ${has('cane') ? '<path d="M78 98 L82 132 M78 98 Q78 92 84 93" stroke="#8a5a32" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''}`;
}

export const chibiSvg = (look, opts) =>
  `<svg viewBox="0 -18 100 152" class="chibi">${chibi(look, opts)}</svg>`;

export const catSvg = (wet = true) => `<svg viewBox="0 0 100 80" class="chibi cat">
  <path d="M18 62 Q14 38 30 32 L26 14 L40 26 Q50 22 60 26 L74 14 L70 32 Q86 38 82 62 Q50 74 18 62Z" fill="#f2a65a"/>
  <path d="M30 40 Q34 36 38 40 M62 40 Q66 36 70 40" stroke="#3a2618" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M47 50 L50 53 L53 50" stroke="#3a2618" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M84 58 Q98 46 92 30" stroke="#f2a65a" stroke-width="7" fill="none" stroke-linecap="round"/>
  ${wet ? '<circle cx="34" cy="18" r="2.4" fill="#9fd4ff"/><circle cx="68" cy="12" r="2" fill="#9fd4ff"/>' : ''}
</svg>`;
