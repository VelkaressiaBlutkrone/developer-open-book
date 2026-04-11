import { useState, useCallback, useRef } from 'react'
import { getBookVisual } from '../data/books'
import type { Book } from '../types'

interface Props {
  book: Book
  index: number
  onClick: () => void
}

function spineFontSize(title: string): string {
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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const bookRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (!bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 12,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltipPos(null)
  }, [])

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (!touched) {
      e.preventDefault()
      setTouched(true)
      if (bookRef.current) {
        const rect = bookRef.current.getBoundingClientRect()
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 12 })
      }
      setTimeout(() => { setTouched(false); setTooltipPos(null) }, 2500)
    } else {
      onClick()
    }
  }, [touched, onClick])

  return (
    <div
      ref={bookRef}
      className={`book${touched ? ' touched' : ''}`}
      onTouchEnd={handleTouch}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

      {/* Floating tooltip — fixed position to avoid overflow clipping */}
      {tooltipPos && (
        <div
          className="book-tooltip visible"
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <span className="tooltip-step">{book.step}</span>
          <span className="tooltip-title">{book.title}</span>
          <span className="tooltip-category">{category}</span>
        </div>
      )}
    </div>
  )
}
