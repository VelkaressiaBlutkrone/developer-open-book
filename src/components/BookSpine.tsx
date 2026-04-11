import { useState, useCallback } from 'react'
import { getBookVisual } from '../data/books'
import type { Book } from '../types'

interface Props {
  book: Book
  index: number
  onClick: () => void
}

function spineFontSize(title: string): string {
  // Count visual length: Korean chars count as 1.6, others as 1
  const len = [...title].reduce((sum, ch) => sum + (/[가-힣]/.test(ch) ? 1.6 : 1), 0)
  if (len <= 14) return '10.5px'
  if (len <= 20) return '9px'
  if (len <= 26) return '8px'
  return '7px'
}

export default function BookSpine({ book, index, onClick }: Props) {
  const v = getBookVisual(book.id)
  const category = book.category === 'dart' ? 'Dart' : 'React'
  const fontSize = spineFontSize(book.title)
  const [touched, setTouched] = useState(false)

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (!touched) {
      e.preventDefault()
      setTouched(true)
      setTimeout(() => setTouched(false), 2500)
    } else {
      onClick()
    }
  }, [touched, onClick])

  return (
    <div
      className={`book${touched ? ' touched' : ''}`}
      onTouchEnd={handleTouch}
      style={{
        '--height': `${v.height}px`,
        '--thickness': `${v.thickness}px`,
        '--cover-color': v.coverColor,
        animationDelay: `${0.08 * index + 0.3}s`,
      } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={`${book.title} 열기`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        className="book-spine"
        style={{
          backgroundColor: v.color,
          width: `var(--thickness)`,
          height: `var(--height)`,
        }}
      >
        <span
          className="spine-title"
          style={{
            maxHeight: `calc(var(--height) - 60px)`,
            fontSize,
          }}
        >
          {book.title}
        </span>
        <span className="spine-badge">{book.step}</span>
      </div>
      <div
        className="book-top"
        style={{ width: `var(--thickness)` }}
      />
      <div
        className="book-cover-peek"
        style={{
          height: `var(--height)`,
          backgroundColor: v.coverColor,
        }}
      >
        <span className="cover-title">{book.title}</span>
        <span className="cover-category">{category}</span>
      </div>

      {/* Floating tooltip */}
      <div className="book-tooltip">
        <span className="tooltip-step">{book.step}</span>
        <span className="tooltip-title">{book.title}</span>
        <span className="tooltip-category">{category}</span>
      </div>
    </div>
  )
}
