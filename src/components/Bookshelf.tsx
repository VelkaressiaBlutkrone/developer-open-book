import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { BOOKS } from '../data/books'
import BookSpine from './BookSpine'
import ReadingView from './ReadingView'
import type { Book } from '../types'

type Filter = 'all' | 'dart' | 'flutter' | 'react'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  dart: 'Dart',
  flutter: 'Flutter',
  react: 'React',
}

export default function Bookshelf() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openBook, setOpenBook] = useState<Book | null>(null)

  const dartBooks = useMemo(() => BOOKS.filter(b => b.category === 'dart'), [])
  const flutterBooks = useMemo(() => BOOKS.filter(b => b.category === 'flutter'), [])
  const reactBooks = useMemo(() => BOOKS.filter(b => b.category === 'react'), [])
  const shelfRefs = useRef<(HTMLDivElement | null)[]>([])

  const setShelfRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    shelfRefs.current[index] = el
  }, [])

  useEffect(() => {
    const rows = shelfRefs.current.filter(Boolean) as HTMLDivElement[]

    const handleWheel = (e: WheelEvent) => {
      const el = e.currentTarget as HTMLDivElement
      if (el.scrollWidth <= el.clientWidth) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    const handleMouseDown = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLDivElement
      if (el.scrollWidth <= el.clientWidth) return
      el.classList.add('dragging')
      const startX = e.pageX
      const startScroll = el.scrollLeft

      const onMove = (ev: MouseEvent) => {
        el.scrollLeft = startScroll - (ev.pageX - startX)
      }
      const onUp = () => {
        el.classList.remove('dragging')
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    rows.forEach(row => {
      row.addEventListener('wheel', handleWheel, { passive: false })
      row.addEventListener('mousedown', handleMouseDown)
    })

    return () => {
      rows.forEach(row => {
        row.removeEventListener('wheel', handleWheel)
        row.removeEventListener('mousedown', handleMouseDown)
      })
    }
  }, [filter])

  const showDart = filter === 'all' || filter === 'dart'
  const showFlutter = filter === 'all' || filter === 'flutter'
  const showReact = filter === 'all' || filter === 'react'

  return (
    <>
      <header className="library-header">
        <a href="#" className="library-title" onClick={(e) => { e.preventDefault(); setFilter('all') }}>
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

      <main className="bookshelf-view">
        {showDart && (
          <section className="shelf-section" data-wood="oak">
            <div className="shelf-label">
              Dart Programming
              <span className="shelf-meta">{dartBooks.length} volumes</span>
            </div>
            <div className="shelf-row" ref={setShelfRef(0)}>
              {dartBooks.map((book, i) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  index={i}
                  onClick={() => setOpenBook(book)}
                />
              ))}
            </div>
          </section>
        )}

        {showFlutter && (
          <section className="shelf-section" data-wood="walnut">
            <div className="shelf-label">
              Flutter Development
              <span className="shelf-meta">{flutterBooks.length} volumes</span>
            </div>
            <div className="shelf-row" ref={setShelfRef(1)}>
              {flutterBooks.map((book, i) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  index={i}
                  onClick={() => setOpenBook(book)}
                />
              ))}
            </div>
          </section>
        )}

        {showReact && (
          <section className="shelf-section" data-wood="cherry">
            <div className="shelf-label">
              React Development
              <span className="shelf-meta">{reactBooks.length} volumes</span>
            </div>
            <div className="shelf-row" ref={setShelfRef(2)}>
              {reactBooks.map((book, i) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  index={i}
                  onClick={() => setOpenBook(book)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="library-floor">
        <div className="library-credit">
          <span className="credit-collection">{BOOKS.length} volumes across {new Set(BOOKS.map(b => b.category)).size} collections</span>
          <span className="credit-divider">&mdash;</span>
          <span>Developer Open Book</span>
        </div>
      </footer>

      <ReadingView
        book={openBook}
        onClose={() => setOpenBook(null)}
      />
    </>
  )
}
