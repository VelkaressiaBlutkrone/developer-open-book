import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes, type RouteConfig } from '../routes';

const SPINE_COLORS = [
  '#6b1c2a', '#1B4F72', '#1a3a2a', '#4a1942',
  '#8B2635', '#2c5f2d', '#7D3C98', '#935116',
  '#1A5276', '#6b3a2a', '#2d4a1e', '#4a2c5f',
  '#703030', '#285f5c', '#5c3d6b', '#6b4f1a',
];

function seedFromPath(path: string) {
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function darken(hex: string, f: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - f))},${Math.round(g * (1 - f))},${Math.round(b * (1 - f))})`;
}

function groupByCategory(items: RouteConfig[]) {
  const groups: Record<string, RouteConfig[]> = {};
  items.forEach((r) => {
    if (r.path === '/') return;
    const cat = r.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });
  return groups;
}

export function BookshelfHome() {
  const groups = useMemo(() => groupByCategory(routes), []);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => Object.keys(groups), [groups]);

  const handleBookClick = useCallback((route: RouteConfig) => {
    navigate(route.path);
  }, [navigate]);

  return (
    <div className="bookshelf-home">
      {/* Library Header */}
      <div className="library-banner">
        <h2 className="library-banner-title">Developer Open Book</h2>
        <p className="library-banner-sub">Archive Collection</p>
        <nav className="shelf-filter">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={filter === cat ? 'active' : ''}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      {/* Shelves */}
      {Object.entries(groups).map(([category, items]) => {
        if (filter !== 'all' && filter !== category) return null;
        return (
          <section key={category} className="shelf-section">
            <div className="shelf-label">
              <span>{category}</span>
            </div>
            <div className="shelf-row">
              {items.map((route, i) => (
                <Book
                  key={route.path}
                  route={route}
                  index={i}
                  category={category}
                  onClick={handleBookClick}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Floor */}
      <div className="library-floor-decor">
        <span>Developer Open Book &mdash; Library Archive</span>
      </div>
    </div>
  );
}

function Book({ route, index, category, onClick }: {
  route: RouteConfig; index: number; category: string;
  onClick: (r: RouteConfig) => void;
}) {
  const seed = seedFromPath(route.path);
  const height = 170 + (seed % 70);
  const thickness = 26 + (seed % 22);
  const colorIndex = seed % SPINE_COLORS.length;
  const color = SPINE_COLORS[colorIndex];
  const coverDark = darken(color, 0.3);

  const stepMatch = route.title.match(/Step\s*(\d+)/i);
  const stepLabel = stepMatch ? `Step ${stepMatch[1]}` : '';
  const titleOnly = route.title.replace(/Step\s*\d+\s*[-—]\s*/i, '').trim();

  return (
    <div
      className="book"
      style={{
        '--height': `${height}px`,
        '--thickness': `${thickness}px`,
        '--cover-color': coverDark,
        animationDelay: `${0.06 * index + 0.2}s`,
      } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`${route.title} 열기`}
      onClick={() => onClick(route)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(route);
        }
      }}
    >
      <div className="book-spine" style={{ backgroundColor: color }}>
        <span className="spine-title">{titleOnly}</span>
        {stepLabel && <span className="spine-badge">{stepLabel}</span>}
      </div>
      <div className="book-top" />
      <div className="book-cover-peek">
        <span className="cover-title">{titleOnly}</span>
        <span className="cover-category">{category}</span>
      </div>
    </div>
  );
}
