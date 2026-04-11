import { useState, useMemo } from 'react'
import { BOOKS } from '../data/books'
import BookSpine from './BookSpine'
import ReadingView from './ReadingView'
import type { Book } from '../types'

type Filter = 'all' | 'dart' | 'react'

export default function Bookshelf() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openBook, setOpenBook] = useState<Book | null>(null)

  const dartBooks = useMemo(() => BOOKS.filter(b => b.category === 'dart'), [])
  const reactBooks = useMemo(() => BOOKS.filter(b => b.category === 'react'), [])

  const showDart = filter === 'all' || filter === 'dart'
  const showReact = filter === 'all' || filter === 'react'

  return (
    <>
      <header className="library-header">
        <a href="#" className="library-title" onClick={(e) => { e.preventDefault(); setFilter('all') }}>
          Developer Open Book <span>Archive</span>
        </a>
        <nav className="library-nav">
          {(['all', 'dart', 'react'] as Filter[]).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'dart' ? 'Dart' : 'React'}
            </button>
          ))}
        </nav>
      </header>

      <main className="bookshelf-view">
        {showDart && (
          <section>
            <div className="shelf-label">Dart Programming</div>
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

        {showReact && (
          <section>
            <div className="shelf-label" style={showDart ? undefined : { marginTop: 0 }}>
              React Development
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
        <div className="library-credit">Developer Open Book &mdash; Library Archive</div>
      </footer>

      <ReadingView
        book={openBook}
        onClose={() => setOpenBook(null)}
      />
    </>
  )
}
