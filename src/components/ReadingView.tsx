import { useState, useEffect, useCallback, useRef } from 'react'
import type { Book } from '../types'
import MarkdownRenderer from './MarkdownRenderer'

interface Props {
  book: Book | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  prevTitle?: string
  nextTitle?: string
}

export default function ReadingView({ book, onClose, onPrev, onNext, prevTitle, nextTitle }: Props) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const visible = book !== null
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!book) { setContent(null); return }
    setLoading(true)
    pageRef.current?.scrollTo(0, 0)
    fetch(book.contentFile)
      .then(res => res.ok ? res.text() : Promise.reject('fetch failed'))
      .then(text => { setContent(text); setLoading(false) })
      .catch(() => { setContent('# 콘텐츠를 불러올 수 없습니다'); setLoading(false) })
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [book])

  useEffect(() => {
    if (!visible) return
    // Focus the close button when the dialog opens
    setTimeout(() => closeRef.current?.focus(), 100)
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()

      if (e.altKey && e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault()
        onPrev()
      }
      if (e.altKey && e.key === 'ArrowRight' && onNext) {
        e.preventDefault()
        onNext()
      }

      // Focus trap: keep Tab cycling inside the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleClose = useCallback(() => {
    const el = document.getElementById('openBook')
    if (el) {
      el.style.transform = 'perspective(1400px) rotateY(20deg) scale(0.5)'
      el.style.opacity = '0'
    }
    setTimeout(() => {
      onClose()
      if (el) { el.style.transform = ''; el.style.opacity = '' }
    }, 500)
  }, [onClose])

  if (!book) return null

  return (
    <div
      className={`reading-view ${visible ? 'visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="독서 뷰"
      ref={dialogRef}
    >
      <div className="reading-overlay" onClick={handleClose} />
      <div className="open-book single-page" id="openBook">
        <button className="close-book" onClick={handleClose} ref={closeRef} aria-label="닫기">Close Book</button>

        <div className="book-page full" ref={pageRef}>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Loading...</span>
            </div>
          ) : content ? (
            <>
              <div className="book-page-header">
                <span className="reading-chapter">{book.step}</span>
                <div className="reading-title">{book.title}</div>
              </div>
              <MarkdownRenderer content={content} />
            </>
          ) : null}

          {(onPrev || onNext) && (
            <div className="reading-nav">
              {onPrev ? (
                <button className="reading-nav-btn prev" onClick={onPrev}>
                  <span className="reading-nav-arrow">&larr;</span>
                  <span className="reading-nav-label">{prevTitle}</span>
                </button>
              ) : <div />}
              {onNext ? (
                <button className="reading-nav-btn next" onClick={onNext}>
                  <span className="reading-nav-label">{nextTitle}</span>
                  <span className="reading-nav-arrow">&rarr;</span>
                </button>
              ) : <div />}
            </div>
          )}

          <div className="book-page-footer">
            <span className="page-category">
              {book.category === 'dart' ? 'Dart Programming' : book.category === 'flutter' ? 'Flutter Development' : 'React Development'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
