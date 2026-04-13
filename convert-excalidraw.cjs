const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'public/diagrams/excalidraw-src');
const OUT_DIR = path.join(__dirname, 'public/diagrams');

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderElement(el) {
  const parts = [];
  const x = el.x || 0, y = el.y || 0;
  const w = el.width || 0, h = el.height || 0;
  const fill = el.backgroundColor || 'transparent';
  const stroke = el.strokeColor || '#1e1e1e';
  const sw = el.strokeWidth || 2;
  const op = el.opacity != null ? el.opacity / 100 : 1;
  const round = el.roundness ? Math.min(w, h) * 0.15 : 0;
  const dash = el.strokeStyle === 'dashed' ? ' stroke-dasharray="8 4"' : '';

  if (el.type === 'rectangle') {
    if (stroke === 'transparent') {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${op}"/>`);
    } else {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${round}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"${dash}/>`);
    }
    // Render contained label
    if (el.label || el.containedText) {
      const label = el.label || el.containedText;
      const lines = label.text.split('\n');
      const fontSize = label.fontSize || 16;
      const color = label.strokeColor || el.labelColor || '#e5e5e5';
      const cx = x + w / 2;
      const totalH = lines.length * (fontSize * 1.3);
      const startY = y + h / 2 - totalH / 2 + fontSize * 0.9;
      lines.forEach((line, i) => {
        parts.push(`<text x="${cx}" y="${startY + i * fontSize * 1.3}" text-anchor="middle" fill="${color}" font-family="Nunito, sans-serif" font-size="${fontSize}">${escapeXml(line)}</text>`);
      });
    }
  } else if (el.type === 'ellipse') {
    const cx = x + w / 2, cy = y + h / 2;
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`);
  } else if (el.type === 'diamond') {
    const cx = x + w / 2, cy = y + h / 2;
    const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
    parts.push(`<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`);
    if (el.label) {
      const lines = el.label.text.split('\n');
      const fontSize = el.label.fontSize || 16;
      const color = el.label.strokeColor || '#e5e5e5';
      const totalH = lines.length * (fontSize * 1.3);
      const startY = cy - totalH / 2 + fontSize * 0.9;
      lines.forEach((line, i) => {
        parts.push(`<text x="${cx}" y="${startY + i * fontSize * 1.3}" text-anchor="middle" fill="${color}" font-family="Nunito, sans-serif" font-size="${fontSize}">${escapeXml(line)}</text>`);
      });
    }
  } else if (el.type === 'text') {
    const fontSize = el.fontSize || 16;
    const color = el.strokeColor || '#e5e5e5';
    const lines = (el.text || '').split('\n');
    lines.forEach((line, i) => {
      parts.push(`<text x="${x}" y="${y + fontSize * 0.9 + i * fontSize * 1.4}" fill="${color}" font-family="Nunito, sans-serif" font-size="${fontSize}" opacity="${op}">${escapeXml(line)}</text>`);
    });
  } else if (el.type === 'arrow') {
    const points = el.points || [[0, 0], [w, 0]];
    const pathParts = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x + p[0]},${y + p[1]}`);
    const markerId = el.endArrowhead ? `arrow-${el.id}` : '';
    const markerAttr = markerId ? ` marker-end="url(#${markerId})"` : '';
    parts.push(`<path d="${pathParts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"${dash}${markerAttr}/>`);
    if (markerId) {
      parts.unshift(`<defs><marker id="${markerId}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${stroke}"/></marker></defs>`);
    }
    // Arrow label
    if (el.label) {
      const mid = Math.floor(points.length / 2);
      const p0 = points[mid - 1] || points[0];
      const p1 = points[mid] || points[points.length - 1];
      const lx = x + (p0[0] + p1[0]) / 2;
      const ly = y + (p0[1] + p1[1]) / 2 - 8;
      const color = el.label.strokeColor || stroke;
      parts.push(`<text x="${lx}" y="${ly}" text-anchor="middle" fill="${color}" font-family="Nunito, sans-serif" font-size="${el.label.fontSize || 14}">${escapeXml(el.label.text)}</text>`);
    }
  }
  return parts.join('\n  ');
}

function convertFile(filename) {
  const raw = fs.readFileSync(path.join(SRC_DIR, filename), 'utf8');
  const data = JSON.parse(raw);
  const elements = data.elements || [];

  // Filter out darkbg (by size: >5000 width), pseudo-elements, contained text
  const drawElements = elements.filter(el =>
    el.type !== 'cameraUpdate' && el.type !== 'delete' && el.type !== 'restoreCheckpoint' &&
    !((el.width || 0) > 5000 && (el.height || 0) > 5000) && // darkbg by size
    !(el.containerId) // skip contained text (rendered by parent)
  );

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  drawElements.forEach(el => {
    const x = el.x || 0, y = el.y || 0;
    const w = el.width || 0, h = el.height || 0;
    if (el.type === 'arrow' && el.points) {
      el.points.forEach(p => {
        minX = Math.min(minX, x + p[0] - 20);
        minY = Math.min(minY, y + p[1] - 20);
        maxX = Math.max(maxX, x + p[0] + 20);
        maxY = Math.max(maxY, y + p[1] + 20);
      });
    } else if (el.type === 'text') {
      const estW = (el.text || '').split('\n').reduce((max, l) => Math.max(max, l.length * (el.fontSize || 16) * 0.55), 0);
      const estH = (el.text || '').split('\n').length * (el.fontSize || 16) * 1.4;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + estW);
      maxY = Math.max(maxY, y + estH);
    } else {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  });

  const pad = 30;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const vw = maxX - minX;
  const vh = maxY - minY;
  const svgW = Math.max(600, Math.min(900, vw));
  const svgH = Math.round(svgW * vh / vw);

  // Merge contained text labels into parent elements
  const containerMap = {};
  elements.forEach(el => {
    if (el.containerId) {
      containerMap[el.containerId] = el;
    }
  });
  drawElements.forEach(el => {
    if (containerMap[el.id] && !el.label) {
      const t = containerMap[el.id];
      el.label = { text: t.text, fontSize: t.fontSize, strokeColor: t.strokeColor };
    }
  });

  const svgContent = drawElements.map(renderElement).filter(Boolean).join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="${minX} ${minY} ${vw} ${vh}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&amp;display=swap');
  </style>
  <rect x="${minX}" y="${minY}" width="${vw}" height="${vh}" rx="12" fill="#141414"/>
  ${svgContent}
</svg>`;

  const outName = filename.replace('.excalidraw', '.svg');
  fs.writeFileSync(path.join(OUT_DIR, outName), svg);
  console.log(`  ${filename} → ${outName}`);
}

// Process all .excalidraw files
const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.excalidraw'));
console.log(`Converting ${files.length} Excalidraw files to SVG...\n`);
files.forEach(convertFile);
console.log(`\nDone: ${files.length} SVGs generated in ${OUT_DIR}`);
