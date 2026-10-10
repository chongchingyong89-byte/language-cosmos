// Canvas-drawn textures for the street: signs, shop windows, vending
// machine, road paint. No image files, so everything stays light.
import * as THREE from 'three';

export const JP_FONT = "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo','Noto Sans JP','Noto Sans CJK JP',sans-serif";

function tex(w, h, draw, { repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

function rng(seed) {
  return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
}

const PRODUCT = ['#f25c54', '#f7b267', '#4ea8de', '#80ed99', '#ffd166', '#c77dff', '#ff8fab', '#ffffff', '#2ec4b6', '#e71d36'];

// Lit shop window: shelves of products, posters, a bright interior.
export function shopWindowTex(seed, { posters = [] } = {}) {
  return tex(1024, 512, (g, w, h) => {
    const r = rng(seed);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#fffdf2');
    grd.addColorStop(1, '#f3efe2');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    for (let row = 0; row < 6; row++) {
      const y = 70 + row * 72;
      g.fillStyle = '#c9d3dc';
      g.fillRect(0, y + 54, w, 6);
      for (let x = 6; x < w - 10;) {
        const bw = 12 + r() * 18, bh = 22 + r() * 30;
        g.fillStyle = PRODUCT[Math.floor(r() * PRODUCT.length)];
        g.fillRect(x, y + 54 - bh, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.fillRect(x + 2, y + 56 - bh, 3, bh - 6);
        x += bw + 3;
      }
    }
    for (const p of posters) {
      g.fillStyle = p.bg;
      g.fillRect(p.x, p.y, p.w, p.h);
      g.fillStyle = p.fg;
      g.font = `bold ${p.size}px ${JP_FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(p.text, p.x + p.w / 2, p.y + p.h / 2);
    }
    // window frames
    g.strokeStyle = '#8796a5';
    g.lineWidth = 10;
    for (let x = 0; x <= w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
}

export function shopSignTex() {
  return tex(1024, 160, (g, w, h) => {
    g.fillStyle = '#fbfdff';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#22a387';
    g.fillRect(0, 0, w, 18);
    g.fillStyle = '#f39a1e';
    g.fillRect(0, h - 14, w, 14);
    g.fillStyle = '#2e9e6e';
    g.beginPath(); g.arc(250, 82, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(222, 88); g.quadraticCurveTo(250, 40, 278, 88); g.closePath(); g.fill();
    g.fillRect(247, 82, 6, 30);
    g.fillStyle = '#2e9e6e';
    g.font = `bold 84px ${JP_FONT}`;
    g.textBaseline = 'middle';
    g.fillText('あまやどり', 310, 82);
    g.font = '18px sans-serif';
    g.fillStyle = '#6aa58a';
    g.fillText('A M A Y A D O R I', 318, 132);
    g.fillStyle = '#f39a1e';
    g.fillRect(840, 34, 120, 92);
    g.fillStyle = '#fff';
    g.font = 'bold 64px sans-serif';
    g.textAlign = 'center';
    g.fillText('24', 900, 84);
    g.font = 'bold 16px sans-serif';
    g.fillText('HOURS', 900, 116);
  });
}

export function doorTex() {
  return tex(256, 512, (g, w, h) => {
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1fa58a';
    g.fillRect(0, 300, w, 40);
    g.fillStyle = '#fff';
    g.font = `bold 26px ${JP_FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('いらっしゃいませ', w / 2, 320);
  });
}

export function vendingTex() {
  return tex(256, 512, (g, w, h) => {
    g.fillStyle = '#e8f1ff';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d2302f';
    g.fillRect(0, 0, w, 60);
    g.fillStyle = '#fff';
    g.font = `bold 28px ${JP_FONT}`;
    g.textAlign = 'center';
    g.fillText('つめた〜い', w / 2, 40);
    const cols = ['#2ec4b6', '#e71d36', '#ff9f1c', '#3a86ff', '#8ac926', '#6d597a', '#f15bb5'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 14 + c * 38, y = 80 + r * 78;
        g.fillStyle = cols[(r * 3 + c) % cols.length];
        g.fillRect(x, y, 26, 50);
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillRect(x + 4, y + 4, 5, 40);
        g.fillStyle = r < 2 ? '#3a86ff' : '#e63946'; // blue = cold, red = hot
        g.fillRect(x, y + 56, 26, 8);
      }
    }
    g.fillStyle = '#2b2f3a';
    g.fillRect(30, 420, 196, 60);
    g.fillStyle = '#7ee8fa';
    g.fillRect(150, 432, 60, 20);
  });
}

// Road paint: white text on transparent, laid flat on the asphalt.
export function roadTextTex(text) {
  return tex(512, 256, (g, w, h) => {
    g.fillStyle = 'rgba(245,245,245,0.92)';
    g.font = `bold 200px ${JP_FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.save();
    g.scale(1, 1.25); // painted road text is stretched for drivers
    g.fillText(text, w / 2, h / 2 / 1.25);
    g.restore();
  });
}

// Japan's stop sign: an upside-down red triangle.
export function stopSignTex() {
  return tex(256, 256, (g) => {
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(8, 20); g.lineTo(248, 20); g.lineTo(128, 236); g.closePath(); g.fill();
    g.fillStyle = '#d7192e';
    g.beginPath(); g.moveTo(26, 30); g.lineTo(230, 30); g.lineTo(128, 216); g.closePath(); g.fill();
    g.fillStyle = '#fff';
    g.font = `bold 52px ${JP_FONT}`;
    g.textAlign = 'center';
    g.fillText('止まれ', 128, 98);
  });
}

export function crossingSignTex() {
  return tex(256, 256, (g) => {
    g.fillStyle = '#1f5fbf';
    g.fillRect(8, 8, 240, 240);
    g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(128, 30); g.lineTo(230, 210); g.lineTo(26, 210); g.closePath(); g.fill();
    g.fillStyle = '#111';
    g.beginPath(); g.arc(128, 92, 13, 0, Math.PI * 2); g.fill();
    g.lineWidth = 12; g.strokeStyle = '#111'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(128, 110); g.lineTo(122, 150); g.lineTo(104, 186); g.moveTo(122, 150); g.lineTo(146, 184); g.moveTo(102, 130); g.lineTo(150, 128); g.stroke();
    g.fillStyle = '#fff';
    g.fillRect(40, 214, 176, 6);
  });
}

export function norenTex() {
  return tex(256, 256, (g, w, h) => {
    g.fillStyle = '#1f3c88';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#162c66';
    g.lineWidth = 6;
    for (let x = w / 3; x < w; x += w / 3) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = '#fff';
    g.font = `bold 64px ${JP_FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('とりや', w / 2, h / 2);
  });
}

export function lanternTex() {
  return tex(128, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 120);
    grd.addColorStop(0, '#ffd27a');
    grd.addColorStop(1, '#e2502f');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b0f08';
    g.font = `bold 56px ${JP_FONT}`;
    g.textAlign = 'center';
    g.fillText('焼', w / 2, 110);
    g.fillText('鳥', w / 2, 180);
  });
}

export function apartmentTex(seed) {
  return tex(512, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = '#2a3048';
    g.fillRect(0, 0, w, h);
    for (let y = 30; y < h; y += 90) {
      for (let x = 30; x < w - 60; x += 110) {
        const lit = r() < 0.45;
        g.fillStyle = lit ? (r() < 0.5 ? '#ffe2a8' : '#cfe3ff') : '#161b2e';
        g.fillRect(x, y, 70, 50);
        g.fillStyle = '#3b4262';
        g.fillRect(x - 6, y + 52, 82, 6);
      }
    }
  });
}

export function tactileTex() {
  return tex(64, 64, (g, w, h) => {
    g.fillStyle = '#e8c33a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9a521';
    for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }
  }, { repeat: [1, 8] });
}

export function sidewalkTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#4a5068';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3a3f55';
    g.lineWidth = 3;
    for (let i = 0; i <= w; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke();
    }
  }, { repeat: [24, 3] });
}

// Patchy wet asphalt: dark with lighter dry/rough spots; drawn over the mirror.
export function asphaltTex() {
  return tex(512, 512, (g, w, h) => {
    const r = rng(11);
    g.fillStyle = 'rgba(16, 20, 38, 0.55)';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(30, 36, 60, ${0.15 + r() * 0.35})`;
      g.beginPath();
      g.arc(r() * w, r() * h, 2 + r() * 18, 0, Math.PI * 2);
      g.fill();
    }
  }, { repeat: [6, 2] });
}

// ── Interior textures ─────────────────────────────────────────────────────
// A hanging/POP sign: big Japanese text, optional small English line.
export function signTex(text, { bg = '#ffffff', fg = '#1d6f8c', sub = '', w = 512, h = 160, size = 84, border = null } = {}) {
  return tex(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    if (border) { g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `bold ${size}px ${JP_FONT}`;
    g.fillText(text, w / 2, sub ? h * 0.42 : h / 2);
    if (sub) {
      g.font = `600 ${Math.round(size * 0.32)}px sans-serif`;
      g.globalAlpha = 0.75;
      g.fillText(sub, w / 2, h * 0.8);
      g.globalAlpha = 1;
    }
  });
}

// An emoji drawn onto a transparent texture: products on the shelves.
const emojiCache = new Map();
export function emojiTex(emoji) {
  if (!emojiCache.has(emoji)) {
    emojiCache.set(emoji, tex(128, 128, (g) => {
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = "100px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
      g.fillText(emoji, 64, 70);
    }));
  }
  return emojiCache.get(emoji);
}

export function floorTex() {
  return tex(256, 256, (g, w, h) => {
    g.fillStyle = '#eef0f2';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d3d7dc';
    g.lineWidth = 3;
    for (let i = 0; i <= w; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke();
    }
  }, { repeat: [6, 5] });
}

// Glass fridge door full of bottles.
export function fridgeTex(seed) {
  return tex(256, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = '#e9f4ff';
    g.fillRect(0, 0, w, h);
    const cols = ['#2ec4b6', '#e71d36', '#ff9f1c', '#3a86ff', '#8ac926', '#f15bb5', '#ffffff', '#6d597a'];
    for (let row = 0; row < 5; row++) {
      const y = 30 + row * 96;
      g.fillStyle = '#b8c6d3';
      g.fillRect(0, y + 80, w, 5);
      for (let x = 10; x < w - 24; x += 30) {
        const c = cols[Math.floor(r() * cols.length)];
        g.fillStyle = c;
        g.fillRect(x, y + 18, 22, 62);
        g.fillRect(x + 7, y + 6, 8, 14);
        g.fillStyle = 'rgba(255,255,255,0.45)';
        g.fillRect(x + 3, y + 24, 4, 50);
      }
    }
    g.strokeStyle = '#8c9aa8';
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
  });
}

// The rainy night street seen through the shop windows: bokeh + streaks.
export function nightWindowTex() {
  return tex(1024, 512, (g, w, h) => {
    const r = rng(77);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#0b1438');
    grd.addColorStop(1, '#1d2a5c');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = r() * w, y = h * 0.35 + r() * h * 0.5, rad = 10 + r() * 30;
      const c = r() < 0.5 ? '255,200,120' : '150,190,255';
      const b = g.createRadialGradient(x, y, 0, x, y, rad);
      b.addColorStop(0, `rgba(${c},0.55)`);
      b.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = b;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.strokeStyle = 'rgba(200,220,255,0.25)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 160; i++) {
      const x = r() * w, y = r() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 18 + r() * 20); g.stroke();
    }
  });
}

export function ceilingLightTex() {
  return tex(64, 256, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#dde3ea';
    g.lineWidth = 4;
    g.strokeRect(2, 2, w - 4, h - 4);
  });
}

// ── Malaysian shophouse textures ──────────────────────────────────────────
// Upper-storey facade: pastel wall, two louvred timber windows, a cornice.
export function shophouseTex(wall, shutter, seed = 1) {
  return tex(256, 256, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(0, 0, w, 22);
    g.fillRect(0, h - 10, w, 10);
    for (const x of [34, 146]) {
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x - 6, 52, 88, 6);
      g.fillStyle = shutter;
      g.fillRect(x, 62, 76, 130);
      g.strokeStyle = 'rgba(0,0,0,0.25)';
      g.lineWidth = 3;
      for (let y = 70; y < 190; y += 10) { g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 72, y); g.stroke(); }
      g.beginPath(); g.moveTo(x + 38, 62); g.lineTo(x + 38, 192); g.stroke();
      if ((seed + x) % 3 === 0) { g.fillStyle = 'rgba(255, 214, 140, 0.85)'; g.fillRect(x + 40, 64, 34, 126); }
    }
  });
}

// Five-foot-way arch: cream wall with a transparent arched opening.
export function archTex() {
  return tex(256, 128, (g, w, h) => {
    g.fillStyle = '#ece0c6';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath();
    g.moveTo(14, h);
    g.lineTo(14, 70);
    g.quadraticCurveTo(w / 2, -18, w - 14, 70);
    g.lineTo(w - 14, h);
    g.closePath();
    g.fill();
    g.globalCompositeOperation = 'source-over';
  });
}

export function grilleTex() {
  return tex(128, 32, (g, w, h) => {
    g.fillStyle = '#0d1018';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#4a5466';
    for (let x = 2; x < w; x += 8) g.fillRect(x, 0, 4, h);
  }, { repeat: [60, 1] });
}

export function menuBoardTex(lines) {
  return tex(256, 320, (g, w, h) => {
    g.fillStyle = '#fbfbf7';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a8f99';
    g.lineWidth = 8;
    g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#c8102e';
    g.font = `bold 34px ${JP_FONT}`;
    g.textAlign = 'center';
    g.fillText('MENU', w / 2, 46);
    g.textAlign = 'left';
    lines.forEach(([name, price], i) => {
      g.fillStyle = '#1d3a8a';
      g.font = `600 22px ${JP_FONT}`;
      g.fillText(name, 18, 96 + i * 42);
      g.textAlign = 'right';
      g.fillStyle = '#111';
      g.fillText(price, w - 18, 96 + i * 42);
      g.textAlign = 'left';
    });
  });
}

// A football match on the mamak TV.
export function footballTex() {
  return tex(256, 144, (g, w, h) => {
    g.fillStyle = '#2e9d4a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#34ad53';
    for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h);
    g.strokeStyle = '#e8f5e9';
    g.lineWidth = 2;
    g.strokeRect(8, 8, w - 16, h - 16);
    g.beginPath(); g.moveTo(w / 2, 8); g.lineTo(w / 2, h - 8); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 20, 0, Math.PI * 2); g.stroke();
    for (const [x, y, c] of [[70, 50, '#e63946'], [100, 90, '#e63946'], [160, 60, '#ffd166'], [185, 100, '#ffd166'], [130, 72, '#ffffff']]) {
      g.fillStyle = c; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillRect(8, 8, 74, 18);
    g.fillStyle = '#fff';
    g.font = 'bold 12px sans-serif';
    g.fillText('MYS 1 - 0', 14, 21);
  });
}

// Five-foot-way floor: Peranakan-style patterned tiles.
export function peranakanTileTex() {
  return tex(128, 128, (g, w, h) => {
    const s = w / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = i * s, y = j * s;
      g.fillStyle = '#efe6d2';
      g.fillRect(x, y, s, s);
      g.fillStyle = '#2f6f7a';
      g.beginPath(); g.moveTo(x + s / 2, y + 4); g.lineTo(x + s - 4, y + s / 2); g.lineTo(x + s / 2, y + s - 4); g.lineTo(x + 4, y + s / 2); g.closePath(); g.fill();
      g.fillStyle = '#c8553d';
      g.beginPath(); g.arc(x + s / 2, y + s / 2, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e9b44c';
      for (const [cx, cy] of [[x, y], [x + s, y], [x, y + s], [x + s, y + s]]) { g.beginPath(); g.arc(cx, cy, 8, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = 'rgba(0,0,0,0.18)';
      g.lineWidth = 2;
      g.strokeRect(x, y, s, s);
    }
  }, { repeat: [160, 5] });
}

export function shutterTex() {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#8d939c';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) {
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(0, y, w, 2);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(0, y + 6, w, 2);
    }
  });
}

export function barberPoleTex() {
  return tex(64, 128, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.lineWidth = 12;
    for (let i = -4; i < 8; i++) {
      g.strokeStyle = i % 2 ? '#d62828' : '#1d4ed8';
      g.beginPath(); g.moveTo(0, i * 24); g.lineTo(w, i * 24 + 40); g.stroke();
    }
  }, { repeat: [1, 1] });
}

// Night skyline: the twin towers glowing over the rooftops.
export function skylineTex() {
  return tex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const tower = (cx) => {
      const grd = g.createLinearGradient(cx - 30, 0, cx + 30, 0);
      grd.addColorStop(0, '#5d6a8f');
      grd.addColorStop(0.5, '#c9d4f0');
      grd.addColorStop(1, '#4b5578');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(cx - 34, h);
      g.lineTo(cx - 34, 210);
      g.lineTo(cx - 26, 170);
      g.lineTo(cx - 18, 130);
      g.lineTo(cx - 8, 100);
      g.lineTo(cx + 8, 100);
      g.lineTo(cx + 18, 130);
      g.lineTo(cx + 26, 170);
      g.lineTo(cx + 34, 210);
      g.lineTo(cx + 34, h);
      g.closePath();
      g.fill();
      g.fillStyle = '#e8eeff';
      g.fillRect(cx - 2, 20, 4, 82);
      g.fillStyle = 'rgba(255,240,200,0.55)';
      for (let y = 220; y < h; y += 9) g.fillRect(cx - 30, y, 60, 2);
    };
    tower(200);
    tower(312);
    g.fillStyle = '#9fb0dd';
    g.fillRect(234, 300, 44, 8);   // the skybridge
    g.fillStyle = 'rgba(40,46,80,0.9)';
    for (const [x, bw, bh] of [[20, 70, 120], [96, 50, 180], [380, 60, 150], [446, 56, 100]]) g.fillRect(x, h - bh, bw, bh);
  });
}
