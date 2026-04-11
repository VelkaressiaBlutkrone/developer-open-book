import { useState, useEffect, useCallback } from 'react'
import type { Book } from '../types'
import MarkdownRenderer from './MarkdownRenderer'

interface Props {
  book: Book | null
  onClose: () => void
}

export default function ReadingView({ book, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const visible = book !== null

  useEffect(() => {
    if (!book) { setContent(null); return }
    setLoading(true)
    fetch(book.contentFile)
      .then(res => res.ok ? res.text() : Promise.reject('fetch failed'))
      .then(text => { setContent(text); setLoading(false) })
      .catch(() => { setContent('# 콘텐츠를 불러올 수 없습니다'); setLoading(false) })
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [book])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
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
    <div className={`reading-view ${visible ? 'visible' : ''}`}>
      <div className="reading-overlay" onClick={handleClose} />
      <div className="open-book single-page" id="openBook">
        <button className="close-book" onClick={handleClose}>Close Book</button>

        <div className="book-page full">
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
