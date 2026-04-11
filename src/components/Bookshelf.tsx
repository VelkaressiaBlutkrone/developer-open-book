import { useState, useMemo } from 'react'
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
            <div className="shelf-row">
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
            <div className="shelf-row">
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
            <div className="shelf-row">
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
