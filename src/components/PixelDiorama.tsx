const BASE = import.meta.env.BASE_URL + 'sprites/';

export function PixelDiorama() {
  return (
    <section className="pixel-diorama" aria-label="Pixel art library room">
      <div className="pixel-wall" />
      <div className="pixel-wall-edge" />
      <div className="pixel-floor" />
      <div className="pixel-carpet" />

      {/* Wall-mounted map */}
      <Sprite src="wallmap.png" alt="Wall map" w={96} h={96} style={{ top: 16, left: '50%', transform: 'translateX(-50%)' }} />

      {/* Candle left */}
      <Sprite src="candle.png" alt="Candle" w={64} h={64} className="pixel-candle" style={{ top: 72, left: '18%' }} />
      <Glow style={{ top: 108, left: 'calc(18% - 8px)' }} />

      {/* Lamp right */}
      <Sprite src="lamp.png" alt="Hanging lamp" w={64} h={96} style={{ top: 8, right: '20%' }} />
      <Glow style={{ top: 80, right: 'calc(20% - 8px)' }} />

      {/* Table center */}
      <Sprite src="table.png" alt="Reading table" w={128} h={96} style={{ bottom: 40, left: '50%', transform: 'translateX(-50%)' }} />

      {/* Chairs */}
      <Sprite src="chair.png" alt="Chair" w={64} h={64} style={{ bottom: 28, left: 'calc(50% - 100px)' }} />
      <Sprite src="chair.png" alt="Chair" w={64} h={64} style={{ bottom: 28, left: 'calc(50% + 64px)' }} imgStyle={{ transform: 'scaleX(-1)' }} />

      {/* Plants */}
      <Sprite src="plant.png" alt="Potted plant" w={64} h={64} style={{ bottom: 56, left: '8%' }} />
      <Sprite src="plant.png" alt="Potted plant" w={64} h={64} style={{ bottom: 56, right: '8%' }} />

      {/* Table candle */}
      <Sprite src="candle.png" alt="Table candle" w={32} h={32} className="pixel-candle" style={{ bottom: 96, left: '50%', transform: 'translateX(-8px)' }} />
      <Glow style={{ bottom: 80, left: 'calc(50% - 24px)', width: 60, height: 30 }} />

      {/* NPCs */}
      <NPC src="librarian/rotations/south.png" alt="Librarian NPC" w={56} h={56} style={{ bottom: 108, left: 'calc(50% + 24px)' }} />
      <NPC src="scholar/rotations/east.png" alt="Scholar NPC" w={48} h={48} delay={-1} style={{ bottom: 52, left: 'calc(50% - 76px)' }} />
      <NPC src="visitor/rotations/west.png" alt="Visitor NPC" w={48} h={48} delay={-2} style={{ bottom: 52, right: '12%' }} />

      <span className="pixel-diorama-label">Pixel Library &mdash; PixelLab AI</span>
    </section>
  );
}

function Sprite({ src, alt, w, h, style, className = '', imgStyle }: {
  src: string; alt: string; w: number; h: number;
  style: React.CSSProperties; className?: string; imgStyle?: React.CSSProperties;
}) {
  return (
    <div className={`pixel-sprite ${className}`} style={style}>
      <img src={BASE + src} alt={alt} width={w} height={h} style={imgStyle} />
    </div>
  );
}

function NPC({ src, alt, w, h, style, delay = 0 }: {
  src: string; alt: string; w: number; h: number;
  style: React.CSSProperties; delay?: number;
}) {
  return (
    <div className="pixel-npc" style={{ ...style, animationDelay: `${delay}s` }}>
      <img src={BASE + src} alt={alt} width={w} height={h} />
    </div>
  );
}

function Glow({ style }: { style: React.CSSProperties }) {
  return <div className="pixel-glow" style={style} />;
}
