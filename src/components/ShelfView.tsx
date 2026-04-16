import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { getBookVisual } from '../data/books'
import type { Book } from '../types'

interface Props {
  category: 'dart' | 'flutter' | 'react'
  label: string
  books: Book[]
  onSelect: (book: Book) => void
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  dart: 'Dart',
  flutter: 'Flutter',
  react: 'React',
}

function spineFontSize(title: string): string {
  const len = [...title].reduce((sum, ch) => sum + (/[가-힣]/.test(ch) ? 1.6 : 1), 0)
  if (len <= 14) return '10.5px'
  if (len <= 20) return '9px'
  if (len <= 26) return '8px'
  return '7px'
}

function ShelfBookSpine({ book, index, onClick }: { book: Book; index: number; onClick: () => void }) {
  const v = getBookVisual(book.id)
  const fontSize = spineFontSize(book.title)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  const handleMouseEnter = useCallback(() => {
    if (!bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 12 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltipPos(null)
  }, [])

  return (
    <>
      <div
        ref={bookRef}
        className="shelf-book"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          '--sv-height': '180px',
          '--sv-thickness': `${v.thickness}px`,
          '--sv-cover-color': v.coverColor,
          animationDelay: `${0.04 * index + 0.15}s`,
        } as React.CSSProperties}
        role="button"
        tabIndex={0}
        aria-label={`${book.title} 열기`}
        aria-describedby={tooltipPos ? tooltipId : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <div
          className="shelf-book-spine"
          style={{
            backgroundColor: v.color,
            width: `var(--sv-thickness)`,
            height: `var(--sv-height)`,
          }}
        >
          <span className="shelf-spine-title" style={{ fontSize }}>
            {book.title}
          </span>
          <span className="shelf-spine-badge">{book.step}</span>
        </div>
        <div className="shelf-book-top" style={{ width: `var(--sv-thickness)` }} />
        <div
          className="shelf-book-cover"
          style={{
            height: `var(--sv-height)`,
            backgroundColor: v.coverColor,
          }}
        >
          <span className="shelf-cover-title">{book.title}</span>
          <span className="shelf-cover-cat">{CATEGORY_LABELS[book.category]}</span>
        </div>
      </div>

      {tooltipPos && createPortal(
        <div
          className="shelf-tooltip visible"
          role="tooltip"
          id={tooltipId}
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <span className="st-step">{book.step}</span>
          <span className="st-title">{book.title}</span>
          <span className="st-category">{CATEGORY_LABELS[book.category]}</span>
        </div>,
        document.body
      )}
    </>
  )
}

export default function ShelfView({ category, label, books, onSelect, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  return (
    <div
      className={`shelf-view-overlay shelf-view-${category}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="shelf-view-container" role="dialog" aria-label={`${label} — ${books.length} volumes`}>
        {/* Header */}
        <div className="shelf-view-header">
          <div className="shelf-view-title-group">
            <h2 className="shelf-view-title">{label}</h2>
            <span className="shelf-view-count">{books.length} volumes</span>
          </div>
          <button className="shelf-view-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* Shelf with books */}
        <div className="shelf-view-books-area">
          <div className="shelf-view-row">
            {books.map((book, i) => (
              <ShelfBookSpine
                key={book.id}
                book={book}
                index={i}
                onClick={() => onSelect(book)}
              />
            ))}
          </div>
          {/* Wooden shelf base */}
          <div className={`shelf-view-base shelf-base-${category}`} />
        </div>
      </div>
    </div>
  )
}
