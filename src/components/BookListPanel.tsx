import { useEffect, useRef } from 'react'
import type { Book } from '../types'

interface Props {
  category: 'dart' | 'flutter' | 'react'
  label: string
  books: Book[]
  onSelect: (book: Book) => void
  onClose: () => void
}

const CATEGORY_ICON: Record<string, string> = {
  dart: '\u{1F3AF}',
  flutter: '\u{1F4F1}',
  react: '\u2699\uFE0F',
}

export default function BookListPanel({ category, label, books, onSelect, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    // delay to avoid the triggering click
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside)
    }, 100)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(timer)
    }
  }, [onClose])

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  return (
    <div
      className={`book-list-panel panel-${category}`}
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label={`${label} - ${books.length} volumes`}
    >
      <div className="panel-header">
        <span className="panel-icon">{CATEGORY_ICON[category]}</span>
        <div className="panel-title-group">
          <h2 className="panel-title">{label}</h2>
          <span className="panel-count">{books.length} volumes</span>
        </div>
        <button className="panel-close" onClick={onClose} aria-label="Close panel">
          &times;
        </button>
      </div>

      <ul className="panel-book-list">
        {books.map((book) => (
          <li key={book.id}>
            <button
              className="panel-book-item"
              onClick={() => onSelect(book)}
            >
              <span className="book-item-step">{book.step}</span>
              <span className="book-item-title">{book.title}</span>
              <span className="book-item-arrow">&rsaquo;</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
