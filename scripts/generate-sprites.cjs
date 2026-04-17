/**
 * Generate pixel art sprites matching existing PixelLab style.
 * Creates 4-direction chairs (32×32) in the same "high top-down" perspective
 * as the NPC sprites.
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'sprites');

function saveCanvas(canvas, filename) {
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, filename), buf);
  console.log(`  ✓ ${filename} (${buf.length} bytes)`);
}

function setPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Color palette matching existing chair.png
const WOOD_DARK  = '#4a1c1c';
const WOOD_MID   = '#6b2e2e';
const WOOD_LIGHT = '#8b4444';
const WOOD_HI    = '#a05555';
const SEAT       = '#7a3030';
const SEAT_SHADOW = '#5a1e1e';
const OUTLINE    = '#2a0e0e';
const TRANSPARENT = 'rgba(0,0,0,0)';

// ── Chair South (facing viewer) ──
function drawChairSouth() {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d');

  // Back rest (top part)
  // Back posts
  for (let y = 4; y <= 14; y++) {
    setPixel(ctx, 10, y, WOOD_DARK);
    setPixel(ctx, 11, y, WOOD_MID);
    setPixel(ctx, 20, y, WOOD_DARK);
    setPixel(ctx, 21, y, WOOD_MID);
  }
  // Back cross bars
  for (let x = 10; x <= 21; x++) {
    setPixel(ctx, x, 4, OUTLINE);
    setPixel(ctx, x, 5, WOOD_HI);
    setPixel(ctx, x, 8, WOOD_MID);
    setPixel(ctx, x, 14, WOOD_DARK);
  }
  // Back slats
  for (let y = 5; y <= 14; y++) {
    setPixel(ctx, 14, y, WOOD_LIGHT);
    setPixel(ctx, 15, y, WOOD_MID);
    setPixel(ctx, 17, y, WOOD_LIGHT);
    setPixel(ctx, 18, y, WOOD_MID);
  }

  // Seat (flat, viewed from above)
  for (let y = 15; y <= 22; y++) {
    for (let x = 9; x <= 22; x++) {
      setPixel(ctx, x, y, y === 15 ? WOOD_DARK : SEAT);
    }
  }
  // Seat highlight
  for (let x = 11; x <= 20; x++) {
    setPixel(ctx, x, 17, WOOD_LIGHT);
    setPixel(ctx, x, 18, SEAT);
  }

  // Front legs
  for (let y = 23; y <= 28; y++) {
    setPixel(ctx, 9, y, WOOD_DARK);
    setPixel(ctx, 10, y, WOOD_MID);
    setPixel(ctx, 21, y, WOOD_DARK);
    setPixel(ctx, 22, y, WOOD_MID);
  }
  // Back legs (visible behind seat)
  for (let y = 23; y <= 26; y++) {
    setPixel(ctx, 12, y, SEAT_SHADOW);
    setPixel(ctx, 19, y, SEAT_SHADOW);
  }
  // Shadow
  for (let x = 9; x <= 22; x++) {
    setPixel(ctx, x, 29, 'rgba(0,0,0,0.2)');
  }

  return c;
}

// ── Chair North (facing away) ──
function drawChairNorth() {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d');

  // Back rest (prominent, facing us)
  for (let y = 4; y <= 16; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22) {
        setPixel(ctx, x, y, WOOD_DARK); // side frame
      } else if (y === 4) {
        setPixel(ctx, x, y, OUTLINE); // top edge
      } else if (y === 5) {
        setPixel(ctx, x, y, WOOD_HI); // highlight
      } else {
        setPixel(ctx, x, y, WOOD_MID); // fill
      }
    }
  }
  // Decorative horizontal bars on back
  for (let x = 10; x <= 21; x++) {
    setPixel(ctx, x, 8, WOOD_LIGHT);
    setPixel(ctx, x, 12, WOOD_LIGHT);
  }

  // Seat (partially hidden behind back)
  for (let y = 17; y <= 22; y++) {
    for (let x = 9; x <= 22; x++) {
      setPixel(ctx, x, y, SEAT_SHADOW);
    }
  }

  // Front legs (shorter, behind seat visually)
  for (let y = 23; y <= 27; y++) {
    setPixel(ctx, 9, y, WOOD_DARK);
    setPixel(ctx, 10, y, WOOD_MID);
    setPixel(ctx, 21, y, WOOD_DARK);
    setPixel(ctx, 22, y, WOOD_MID);
  }
  // Shadow
  for (let x = 9; x <= 22; x++) {
    setPixel(ctx, x, 28, 'rgba(0,0,0,0.2)');
  }

  return c;
}

// ── Chair East (facing right) ──
function drawChairEast() {
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d');

  // Back rest (left side, vertical)
  for (let y = 4; y <= 14; y++) {
    setPixel(ctx, 8, y, OUTLINE);
    setPixel(ctx, 9, y, WOOD_HI);
    setPixel(ctx, 10, y, WOOD_MID);
    setPixel(ctx, 11, y, WOOD_DARK);
  }
  // Top of back rest
  for (let x = 8; x <= 11; x++) {
    setPixel(ctx, x, 4, OUTLINE);
  }
  // Back rest horizontal slats
  for (let y = 6; y <= 13; y += 3) {
    for (let x = 8; x <= 11; x++) {
      setPixel(ctx, x, y, WOOD_LIGHT);
    }
  }

  // Seat
  for (let y = 15; y <= 22; y++) {
    for (let x = 8; x <= 22; x++) {
      setPixel(ctx, x, y, y === 15 ? WOOD_DARK : SEAT);
    }
  }
  // Seat highlight
  for (let x = 12; x <= 20; x++) {
    setPixel(ctx, x, 17, WOOD_LIGHT);
  }

  // Legs
  // Back left
  for (let y = 23; y <= 28; y++) {
    setPixel(ctx, 8, y, WOOD_DARK);
    setPixel(ctx, 9, y, WOOD_MID);
  }
  // Front left
  for (let y = 23; y <= 27; y++) {
    setPixel(ctx, 12, y, SEAT_SHADOW);
  }
  // Back right
  for (let y = 23; y <= 28; y++) {
    setPixel(ctx, 21, y, WOOD_DARK);
    setPixel(ctx, 22, y, WOOD_MID);
  }
  // Front right
  for (let y = 23; y <= 27; y++) {
    setPixel(ctx, 18, y, SEAT_SHADOW);
  }
  // Shadow
  for (let x = 8; x <= 22; x++) {
    setPixel(ctx, x, 29, 'rgba(0,0,0,0.15)');
  }

  return c;
}

// ── Chair West (facing left) — mirror of East ──
function drawChairWest() {
  const east = drawChairEast();
  const c = createCanvas(32, 32);
  const ctx = c.getContext('2d');
  // Flip horizontally
  ctx.translate(32, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(east, 0, 0);
  return c;
}

// ── Generate all ──
console.log('Generating pixel art sprites...\n');

// Create chairs directory
const chairDir = path.join(OUT, 'chairs');
if (!fs.existsSync(chairDir)) fs.mkdirSync(chairDir, { recursive: true });

const south = drawChairSouth();
saveCanvas(south, 'chairs/south.png');

const north = drawChairNorth();
saveCanvas(north, 'chairs/north.png');

const east = drawChairEast();
saveCanvas(east, 'chairs/east.png');

const west = drawChairWest();
saveCanvas(west, 'chairs/west.png');

console.log('\n4 chair direction sprites generated.');

// ═══════════════════════════════════════════
// RESEARCHER NPC (48×48, blue/purple palette)
// ═══════════════════════════════════════════

const R_HAIR = '#2a1a4e';
const R_SKIN = '#e8c8a0';
const R_ROBE = '#4a3a8b';
const R_ROBE_LIGHT = '#6b5aab';
const R_ROBE_DARK = '#332870';
const R_BOOK = '#d4a017';
const R_GLASSES = '#87CEEB';

function drawResearcherSouth() {
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d');

  // Hair
  for (let x = 18; x <= 29; x++) { setPixel(ctx, x, 6, R_HAIR); setPixel(ctx, x, 7, R_HAIR); }
  for (let x = 17; x <= 30; x++) { setPixel(ctx, x, 8, R_HAIR); setPixel(ctx, x, 9, R_HAIR); }

  // Face
  for (let y = 10; y <= 15; y++) for (let x = 19; x <= 28; x++) setPixel(ctx, x, y, R_SKIN);
  // Glasses
  setPixel(ctx, 20, 12, R_GLASSES); setPixel(ctx, 21, 12, R_GLASSES);
  setPixel(ctx, 26, 12, R_GLASSES); setPixel(ctx, 27, 12, R_GLASSES);
  setPixel(ctx, 22, 12, R_GLASSES); setPixel(ctx, 25, 12, R_GLASSES); // bridge
  // Eyes
  setPixel(ctx, 21, 12, '#1a1a2e'); setPixel(ctx, 26, 12, '#1a1a2e');

  // Robe body
  for (let y = 16; y <= 32; y++) {
    const w = y < 20 ? 6 : y < 28 ? 8 : 7;
    const cx = 24;
    for (let x = cx - w; x <= cx + w; x++) {
      setPixel(ctx, x, y, y % 3 === 0 ? R_ROBE_LIGHT : R_ROBE);
    }
  }
  // Robe dark edges
  for (let y = 16; y <= 32; y++) {
    setPixel(ctx, 16, y, R_ROBE_DARK); setPixel(ctx, 32, y, R_ROBE_DARK);
  }

  // Book in hand (right side)
  for (let y = 22; y <= 28; y++) for (let x = 30; x <= 35; x++) setPixel(ctx, x, y, R_BOOK);
  for (let x = 31; x <= 34; x++) setPixel(ctx, x, 24, '#fff'); // pages

  // Hands
  setPixel(ctx, 29, 24, R_SKIN); setPixel(ctx, 29, 25, R_SKIN);

  // Legs/feet
  for (let y = 33; y <= 37; y++) {
    setPixel(ctx, 20, y, R_ROBE_DARK); setPixel(ctx, 21, y, R_ROBE);
    setPixel(ctx, 26, y, R_ROBE_DARK); setPixel(ctx, 27, y, R_ROBE);
  }
  // Shoes
  for (let x = 19; x <= 22; x++) setPixel(ctx, x, 38, '#2a1a1a');
  for (let x = 25; x <= 28; x++) setPixel(ctx, x, 38, '#2a1a1a');

  // Shadow
  for (let x = 18; x <= 30; x++) setPixel(ctx, x, 39, 'rgba(0,0,0,0.15)');

  return c;
}

function drawResearcherNorth() {
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d');

  // Hair (back view, more visible)
  for (let x = 17; x <= 30; x++) for (let y = 6; y <= 14; y++) setPixel(ctx, x, y, R_HAIR);

  // Robe body (back)
  for (let y = 15; y <= 32; y++) {
    const w = y < 20 ? 6 : y < 28 ? 8 : 7;
    for (let x = 24 - w; x <= 24 + w; x++) setPixel(ctx, x, y, y % 4 === 0 ? R_ROBE_LIGHT : R_ROBE);
  }
  for (let y = 15; y <= 32; y++) { setPixel(ctx, 16, y, R_ROBE_DARK); setPixel(ctx, 32, y, R_ROBE_DARK); }

  // Legs
  for (let y = 33; y <= 37; y++) {
    setPixel(ctx, 20, y, R_ROBE_DARK); setPixel(ctx, 21, y, R_ROBE);
    setPixel(ctx, 26, y, R_ROBE_DARK); setPixel(ctx, 27, y, R_ROBE);
  }
  for (let x = 19; x <= 22; x++) setPixel(ctx, x, 38, '#2a1a1a');
  for (let x = 25; x <= 28; x++) setPixel(ctx, x, 38, '#2a1a1a');
  for (let x = 18; x <= 30; x++) setPixel(ctx, x, 39, 'rgba(0,0,0,0.15)');

  return c;
}

function drawResearcherEast() {
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d');

  // Hair (side)
  for (let x = 20; x <= 28; x++) for (let y = 6; y <= 10; y++) setPixel(ctx, x, y, R_HAIR);
  // Face (side)
  for (let y = 10; y <= 15; y++) for (let x = 22; x <= 28; x++) setPixel(ctx, x, y, R_SKIN);
  setPixel(ctx, 27, 12, '#1a1a2e'); // eye
  setPixel(ctx, 26, 12, R_GLASSES); setPixel(ctx, 28, 12, R_GLASSES);

  // Robe
  for (let y = 16; y <= 32; y++) {
    const w = y < 20 ? 5 : 7;
    for (let x = 19; x <= 19 + w * 2; x++) setPixel(ctx, x, y, y % 3 === 0 ? R_ROBE_LIGHT : R_ROBE);
  }

  // Book (held forward)
  for (let y = 20; y <= 26; y++) for (let x = 32; x <= 37; x++) setPixel(ctx, x, y, R_BOOK);
  setPixel(ctx, 31, 22, R_SKIN); setPixel(ctx, 31, 23, R_SKIN);

  // Legs
  for (let y = 33; y <= 37; y++) { setPixel(ctx, 22, y, R_ROBE_DARK); setPixel(ctx, 26, y, R_ROBE_DARK); }
  for (let x = 21; x <= 23; x++) setPixel(ctx, x, 38, '#2a1a1a');
  for (let x = 25; x <= 27; x++) setPixel(ctx, x, 38, '#2a1a1a');
  for (let x = 20; x <= 28; x++) setPixel(ctx, x, 39, 'rgba(0,0,0,0.15)');

  return c;
}

function drawResearcherWest() {
  const east = drawResearcherEast();
  const c = createCanvas(48, 48);
  const ctx = c.getContext('2d');
  ctx.translate(48, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(east, 0, 0);
  return c;
}

// Generate researcher NPC
const researcherDir = path.join(OUT, 'researcher', 'rotations');
if (!fs.existsSync(researcherDir)) fs.mkdirSync(researcherDir, { recursive: true });

saveCanvas(drawResearcherSouth(), 'researcher/rotations/south.png');
saveCanvas(drawResearcherNorth(), 'researcher/rotations/north.png');
saveCanvas(drawResearcherEast(), 'researcher/rotations/east.png');
saveCanvas(drawResearcherWest(), 'researcher/rotations/west.png');

console.log('4 researcher NPC sprites generated.\n\nAll done!');
