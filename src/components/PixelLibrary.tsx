import { useState, useMemo, useCallback } from 'react'
import { BOOKS } from '../data/books'
import { LIBRARY_MAP, LIBRARY_COLS, LIBRARY_ROWS, INTERACTIVE_ZONES } from '../data/libraryMap'
import { Tile, type TileValue } from '../types/tiles'
import type { Book } from '../types'
import TileRenderer from './TileRenderer'
import BookListPanel from './BookListPanel'
import ReadingView from './ReadingView'

type Filter = 'all' | 'dart' | 'flutter' | 'react'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  dart: 'Dart',
  flutter: 'Flutter',
  react: 'React',
}

const SHELF_TILES = new Set<TileValue>([Tile.SHELF_DART, Tile.SHELF_FLUTTER, Tile.SHELF_REACT])

function tileCategory(tile: TileValue): 'dart' | 'flutter' | 'react' | null {
  if (tile === Tile.SHELF_DART) return 'dart'
  if (tile === Tile.SHELF_FLUTTER) return 'flutter'
  if (tile === Tile.SHELF_REACT) return 'react'
  return null
}

export default function PixelLibrary() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedCategory, setSelectedCategory] = useState<'dart' | 'flutter' | 'react' | null>(null)
  const [openBook, setOpenBook] = useState<Book | null>(null)

  const dartBooks = useMemo(() => BOOKS.filter(b => b.category === 'dart'), [])
  const flutterBooks = useMemo(() => BOOKS.filter(b => b.category === 'flutter'), [])
  const reactBooks = useMemo(() => BOOKS.filter(b => b.category === 'react'), [])

  const categoryBooks = useMemo(() => ({
    dart: dartBooks,
    flutter: flutterBooks,
    react: reactBooks,
  }), [dartBooks, flutterBooks, reactBooks])

  const navProps = useMemo(() => {
    if (!openBook) return {}
    const books = BOOKS.filter(b => b.category === openBook.category)
    const idx = books.findIndex(b => b.id === openBook.id)
    const prevBook = idx > 0 ? books[idx - 1] : null
    const nextBook = idx < books.length - 1 ? books[idx + 1] : null
    return {
      onPrev: prevBook ? () => setOpenBook(prevBook) : undefined,
      onNext: nextBook ? () => setOpenBook(nextBook) : undefined,
      prevTitle: prevBook?.title,
      nextTitle: nextBook?.title,
    }
  }, [openBook])

  const handleShelfClick = useCallback((category: 'dart' | 'flutter' | 'react') => {
    setSelectedCategory(category)
  }, [])

  const handleBookSelect = useCallback((book: Book) => {
    setSelectedCategory(null)
    setOpenBook(book)
  }, [])

  const handlePanelClose = useCallback(() => {
    setSelectedCategory(null)
  }, [])

  // Check if a cell is part of an interactive zone
  const getZoneForCell = useCallback((row: number, col: number) => {
    return INTERACTIVE_ZONES.find(z =>
      row >= z.row && row < z.row + z.height &&
      col >= z.col && col < z.col + z.width
    ) ?? null
  }, [])

  return (
    <>
      <header className="library-header pixel-header">
        <a href="#" className="library-title pixel-title" onClick={(e) => { e.preventDefault(); setFilter('all') }}>
          Developer Open Book <span>Archive</span>
        </a>
        <nav className="library-nav">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </nav>
      </header>

      <main className="pixel-library-view">
        <div
          className="pixel-scene"
          style={{
            '--cols': LIBRARY_COLS,
            '--rows': LIBRARY_ROWS,
          } as React.CSSProperties}
        >
          {/* Light sources */}
          {LIBRARY_MAP.flatMap((row, r) =>
            row.map((tile, c) => {
              if (tile === Tile.CANDLE || tile === Tile.LAMP) {
                return (
                  <div
                    key={`light-${r}-${c}`}
                    className={`light-source ${tile === Tile.CANDLE ? 'light-candle' : 'light-lamp'}`}
                    style={{
                      '--light-col': c,
                      '--light-row': r,
                    } as React.CSSProperties}
                  />
                )
              }
              return null
            })
          )}

          {/* Tile grid */}
          {LIBRARY_MAP.flatMap((row, r) =>
            row.map((tile, c) => {
              const cat = tileCategory(tile)
              const isShelf = SHELF_TILES.has(tile)
              const dimmed = filter !== 'all' && cat !== null && cat !== filter
              const highlighted = filter !== 'all' && cat === filter
              const zone = isShelf ? getZoneForCell(r, c) : null

              // Determine if this is the first cell of a zone (top-left)
              const isZoneAnchor = zone && zone.row === r && zone.col === c

              return (
                <div
                  key={`${r}-${c}`}
                  className={`tile-cell${isShelf ? ' tile-interactive' : ''}${dimmed ? ' tile-dimmed' : ''}${highlighted ? ' tile-highlighted' : ''}${selectedCategory === cat ? ' tile-selected' : ''}`}
                  style={{
                    gridColumn: c + 1,
                    gridRow: r + 1,
                  }}
                  onClick={isShelf && cat ? () => handleShelfClick(cat) : undefined}
                  role={isShelf ? 'button' : undefined}
                  tabIndex={isZoneAnchor ? 0 : isShelf ? -1 : undefined}
                  aria-label={isZoneAnchor && zone ? `${zone.label} — ${categoryBooks[zone.category].length} volumes. Click to browse.` : undefined}
                  onKeyDown={isZoneAnchor && cat ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleShelfClick(cat)
                    }
                  } : undefined}
                >
                  <TileRenderer tile={tile} />
                </div>
              )
            })
          )}
        </div>

        {/* Mobile simplified view */}
        <div className="pixel-mobile-view">
          <div className="mobile-zone-cards">
            {(['dart', 'flutter', 'react'] as const)
              .filter(cat => filter === 'all' || filter === cat)
              .map(cat => (
                <button
                  key={cat}
                  className={`mobile-zone-card zone-${cat}`}
                  onClick={() => handleShelfClick(cat)}
                >
                  <div className="zone-card-shelves">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="zone-card-shelf-row">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="zone-card-book" />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="zone-card-info">
                    <span className="zone-card-label">
                      {cat === 'dart' ? 'Dart Programming' : cat === 'flutter' ? 'Flutter Development' : 'React Development'}
                    </span>
                    <span className="zone-card-count">{categoryBooks[cat].length} volumes</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </main>

      <footer className="library-floor pixel-footer">
        <div className="library-credit">
          <span className="credit-collection">{BOOKS.length} volumes across {new Set(BOOKS.map(b => b.category)).size} collections</span>
          <span className="credit-divider">&mdash;</span>
          <span>Developer Open Book</span>
        </div>
      </footer>

      {selectedCategory && (
        <BookListPanel
          category={selectedCategory}
          label={selectedCategory === 'dart' ? 'Dart Programming' : selectedCategory === 'flutter' ? 'Flutter Development' : 'React Development'}
          books={categoryBooks[selectedCategory]}
          onSelect={handleBookSelect}
          onClose={handlePanelClose}
        />
      )}

      <ReadingView
        book={openBook}
        onClose={() => setOpenBook(null)}
        {...navProps}
      />
    </>
  )
}
