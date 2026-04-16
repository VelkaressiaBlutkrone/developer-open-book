import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type RouteConfig, routes } from '../routes';

const B = import.meta.env.BASE_URL + 'sprites/';

/* ── 책장 = 언어/주제 단위. 모든 문서가 하나의 책장에 ── */
interface ShelfDef {
  id: string;
  label: string;
  icon: string;
  filter: (r: RouteConfig) => boolean;
  pos: string;
}

const SHELVES: ShelfDef[] = [
  {
    id: 'dart', label: 'Dart', icon: '📘',
    filter: r => r.shelf === 'dart',
    pos: 'top-left',
  },
  {
    id: 'flutter', label: 'Flutter', icon: '📗',
    filter: r => r.shelf === 'flutter',
    pos: 'top-center',
  },
  {
    id: 'react', label: 'React', icon: '📙',
    filter: r => r.shelf === 'react',
    pos: 'top-right',
  },
  {
    id: 'spring', label: 'Spring Boot', icon: '📕',
    filter: r => r.shelf === 'spring',
    pos: 'bot-left',
  },
  {
    id: 'etc', label: 'Archive', icon: '📓',
    filter: r => r.shelf === 'archive',
    pos: 'bot-right',
  },
];

const SPINE_COLORS = [
  '#6b1c2a', '#1B4F72', '#1a3a2a', '#4a1942', '#8B2635',
  '#2c5f2d', '#7D3C98', '#935116', '#1A5276', '#6b3a2a',
  '#2d4a1e', '#4a2c5f', '#703030', '#285f5c', '#5c3d6b',
];

function seedHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

export function LibraryRoom() {
  const [openShelf, setOpenShelf] = useState<ShelfDef | null>(null);
  const navigate = useNavigate();

  const handleBookClick = useCallback((route: RouteConfig) => {
    setOpenShelf(null);
    navigate(route.path);
  }, [navigate]);

  return (
    <div className="lr">
      <div className="lr-floor" />
      <div className="lr-wall lr-wall-t" />
      <div className="lr-wall lr-wall-b" />
      <div className="lr-wall lr-wall-l" />
      <div className="lr-wall lr-wall-r" />

      {/* Bookshelves */}
      {SHELVES.map(shelf => {
        const books = routes.filter(shelf.filter);
        const empty = books.length === 0;
        return (
          <div key={shelf.id} className={`lr-shelf-wrap lr-shelf-${shelf.pos}`}>
            <button
              className={`lr-shelf ${empty ? 'lr-shelf-empty' : ''}`}
              onClick={() => setOpenShelf(shelf)}
              aria-label={`${shelf.label} (${books.length}권)`}
            >
              {/* Book rows visual */}
              <div className="lr-shelf-books">
                <div className="lr-shelf-bookrow" />
                <div className="lr-shelf-plank" />
                <div className="lr-shelf-bookrow" />
                <div className="lr-shelf-plank" />
                <div className="lr-shelf-bookrow lr-shelf-bookrow-short" />
                <div className="lr-shelf-plank" />
              </div>
            </button>
            {/* Nameplate sign in FRONT of shelf */}
            <div className="lr-sign">
              <span className="lr-sign-icon">{shelf.icon}</span>
              <span className="lr-sign-text">{shelf.label}</span>
              {!empty && <span className="lr-sign-count">{books.length}</span>}
              {empty && <span className="lr-sign-soon">Soon</span>}
            </div>
          </div>
        );
      })}

      {/* Side wall decorative shelves */}
      <div className="lr-deco-shelf lr-deco-left" />
      <div className="lr-deco-shelf lr-deco-right" />

      {/* ── Central area furniture ── */}

      {/* Large carpet under center */}
      <div className="lr-carpet" />

      {/* Main reading table (center) */}
      <img src={B + 'table.png'} className="lr-obj" alt=""
        style={{ top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: '18vmin', height: '13vmin', zIndex: 3 }} />
      <img src={B + 'candle.png'} className="lr-obj pixel-candle" alt=""
        style={{ top: '33%', left: '50%', transform: 'translateX(-50%)', width: '6vmin', height: '6vmin', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '32%', left: '44%', width: '14vmin', height: '10vmin' }} />

      {/* Chairs around main table */}
      <img src={B + 'chair.png'} className="lr-obj" alt=""
        style={{ top: '48%', left: '36%', width: '9vmin', height: '9vmin' }} />
      <img src={B + 'chair.png'} className="lr-obj" alt=""
        style={{ top: '48%', right: '36%', width: '9vmin', height: '9vmin', transform: 'scaleX(-1)' }} />

      {/* Left reading nook */}
      <img src={B + 'table.png'} className="lr-obj" alt=""
        style={{ top: '56%', left: '18%', width: '14vmin', height: '10vmin', zIndex: 3 }} />
      <img src={B + 'candle.png'} className="lr-obj pixel-candle" alt=""
        style={{ top: '50%', left: '21%', width: '5vmin', height: '5vmin', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '48%', left: '16%', width: '14vmin', height: '10vmin' }} />
      <img src={B + 'chair.png'} className="lr-obj" alt=""
        style={{ top: '64%', left: '15%', width: '8vmin', height: '8vmin' }} />

      {/* Right reading nook */}
      <img src={B + 'table.png'} className="lr-obj" alt=""
        style={{ top: '56%', right: '18%', width: '14vmin', height: '10vmin', zIndex: 3 }} />
      <img src={B + 'candle.png'} className="lr-obj pixel-candle" alt=""
        style={{ top: '50%', right: '21%', width: '5vmin', height: '5vmin', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '48%', right: '16%', width: '14vmin', height: '10vmin' }} />
      <img src={B + 'chair.png'} className="lr-obj" alt=""
        style={{ top: '64%', right: '15%', width: '8vmin', height: '8vmin', transform: 'scaleX(-1)' }} />

      {/* ── Corner plants ── */}
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ top: '5%', left: '2%', width: '9vmin', height: '9vmin', zIndex: 4 }} />
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ top: '5%', right: '2%', width: '9vmin', height: '9vmin', zIndex: 4 }} />
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ bottom: '5%', left: '2%', width: '9vmin', height: '9vmin', zIndex: 4 }} />
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ bottom: '5%', right: '2%', width: '9vmin', height: '9vmin', zIndex: 4 }} />
      {/* Center-side plants */}
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ top: '42%', left: '14%', width: '8vmin', height: '8vmin', zIndex: 4 }} />
      <img src={B + 'plant.png'} className="lr-obj" alt="" style={{ top: '42%', right: '14%', width: '8vmin', height: '8vmin', zIndex: 4 }} />

      {/* ── Wall lamps ── */}
      <img src={B + 'lamp.png'} className="lr-obj" alt="" style={{ top: '0%', left: '26%', width: '6vmin', height: '9vmin', zIndex: 4 }} />
      <img src={B + 'lamp.png'} className="lr-obj" alt="" style={{ top: '0%', right: '26%', width: '6vmin', height: '9vmin', zIndex: 4 }} />
      <img src={B + 'lamp.png'} className="lr-obj" alt="" style={{ top: '0%', left: '50%', transform: 'translateX(-50%)', width: '6vmin', height: '9vmin', zIndex: 4 }} />

      {/* ── Side wall candles ── */}
      <img src={B + 'candle.png'} className="lr-obj pixel-candle" alt="" style={{ top: '38%', left: '7%', width: '6vmin', height: '6vmin', zIndex: 4 }} />
      <img src={B + 'candle.png'} className="lr-obj pixel-candle" alt="" style={{ top: '38%', right: '7%', width: '6vmin', height: '6vmin', zIndex: 4 }} />
      <div className="lr-glow" style={{ top: '36%', left: '4%', width: '12vmin', height: '10vmin' }} />
      <div className="lr-glow" style={{ top: '36%', right: '4%', width: '12vmin', height: '10vmin' }} />

      {/* ── Wall map ── */}
      <img src={B + 'wallmap.png'} className="lr-obj" alt=""
        style={{ top: '0%', left: '50%', transform: 'translateX(-50%)', width: '11vmin', height: '11vmin', zIndex: 3 }} />

      {/* ── NPCs (proportional to tables) ── */}
      <img src={B + 'librarian/rotations/south.png'} className="lr-npc" alt=""
        style={{ top: '35%', left: '55%', width: '10vmin', height: '10vmin' }} />
      <img src={B + 'scholar/rotations/east.png'} className="lr-npc" alt=""
        style={{ top: '58%', left: '24%', width: '9vmin', height: '9vmin', animationDelay: '-1.2s' }} />
      <img src={B + 'visitor/rotations/west.png'} className="lr-npc" alt=""
        style={{ top: '58%', right: '24%', width: '9vmin', height: '9vmin', animationDelay: '-2.5s' }} />

      <div className="lr-vignette" />

      <div className="lr-title">
        <h1>Developer Open Book</h1>
        <p>책장을 클릭하여 도서를 탐색하세요</p>
      </div>

      {/* Shelf Modal */}
      {openShelf && (
        <ShelfModal
          shelf={openShelf}
          books={routes.filter(openShelf.filter)}
          onClose={() => setOpenShelf(null)}
          onBookClick={handleBookClick}
        />
      )}

    </div>
  );
}

function ShelfModal({ shelf, books, onClose, onBookClick }: {
  shelf: ShelfDef; books: RouteConfig[];
  onClose: () => void; onBookClick: (r: RouteConfig) => void;
}) {
  return (
    <div className="shelf-modal-overlay" onClick={onClose}>
      <div className="shelf-modal" onClick={e => e.stopPropagation()}>
        <div className="shelf-modal-header">
          <span style={{ fontSize: '1.3rem' }}>{shelf.icon}</span>
          <h2>{shelf.label}</h2>
          <span className="shelf-modal-count">{books.length}권</span>
          <button className="shelf-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="shelf-modal-books">
          {books.length === 0 && (
            <div className="shelf-modal-empty">
              <span style={{ fontSize: '2rem' }}>{shelf.icon}</span>
              <p>이 책장은 아직 준비 중입니다</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Coming Soon</p>
            </div>
          )}
          {chunkArray(books, 10).map((row, ri) => (
            <div key={ri} className="modal-shelf-unit">
              <div className="modal-shelf-row">
                {row.map((book, i) => {
                  const seed = seedHash(book.path);
                  const height = 130 + (seed % 50);
                  const thickness = 28 + (seed % 18);
                  const color = SPINE_COLORS[seed % SPINE_COLORS.length];
                  const stepMatch = book.title.match(/Step\s*(\d+)/i);
                  const stepLabel = stepMatch ? `Step ${stepMatch[1]}` : '';
                  const titleOnly = book.title.replace(/Step\s*\d+\s*[-—]\s*/i, '').trim();
                  return (
                    <div key={book.path} className="modal-book" role="button" tabIndex={0}
                      title={book.title}
                      style={{ '--height': `${height}px`, '--thickness': `${thickness}px`, animationDelay: `${0.03*i}s` } as React.CSSProperties}
                      onClick={() => onBookClick(book)}
                      onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); onBookClick(book); } }}>
                      <div className="modal-book-spine" style={{ backgroundColor: color }}>
                        <span className="modal-spine-title">{titleOnly}</span>
                        {stepLabel && <span className="modal-spine-badge">{stepLabel}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="modal-shelf-plank" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
