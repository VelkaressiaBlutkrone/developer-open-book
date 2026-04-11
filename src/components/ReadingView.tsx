import { useState, useEffect, useCallback, useRef } from 'react'
import type { Book, BookPage } from '../types'

interface Props {
  book: Book | null
  onClose: () => void
}

export default function ReadingView({ book, onClose }: Props) {
  const [pageIndex, setPageIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const flipContainerRef = useRef<HTMLDivElement>(null)
  const visible = book !== null

  useEffect(() => {
    if (book) {
      setPageIndex(0)
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [book])

  const totalPairs = book ? Math.ceil(book.pages.length / 2) : 0

  const animateFlip = useCallback((direction: 'forward' | 'backward', callback: () => void) => {
    if (isFlipping || !flipContainerRef.current) return
    setIsFlipping(true)

    const container = flipContainerRef.current
    const flip = document.createElement('div')
    flip.className = 'page-flip'

    const front = document.createElement('div')
    front.className = 'page-flip-front'

    const back = document.createElement('div')
    back.className = 'page-flip-back'

    flip.appendChild(front)
    flip.appendChild(back)
    container.appendChild(flip)

    requestAnimationFrame(() => {
      flip.classList.add(direction === 'forward' ? 'flipping-forward' : 'flipping-backward')
    })

    const cleanup = () => {
      container.innerHTML = ''
      setIsFlipping(false)
      callback()
    }

    flip.addEventListener('animationend', cleanup, { once: true })
    setTimeout(() => {
      if (isFlipping) cleanup()
    }, 800)
  }, [isFlipping])

  const nextPage = useCallback(() => {
    if (!book || pageIndex >= totalPairs - 1 || isFlipping) return
    animateFlip('forward', () => setPageIndex(p => p + 1))
  }, [book, pageIndex, totalPairs, isFlipping, animateFlip])

  const prevPage = useCallback(() => {
    if (!book || pageIndex <= 0 || isFlipping) return
    animateFlip('backward', () => setPageIndex(p => p - 1))
  }, [book, pageIndex, isFlipping, animateFlip])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onClose, nextPage, prevPage])

  const handleClose = () => {
    const el = document.getElementById('openBook')
    if (el) {
      el.style.transform = 'perspective(1400px) rotateY(20deg) scale(0.5)'
      el.style.opacity = '0'
    }
    setTimeout(() => {
      onClose()
      if (el) {
        el.style.transform = ''
        el.style.opacity = ''
      }
    }, 500)
  }

  if (!book) return null

  const leftData = book.pages[pageIndex * 2] ?? null
  const rightData = book.pages[pageIndex * 2 + 1] ?? null
  const hasPages = book.pages.length > 0

  return (
    <div className={`reading-view ${visible ? 'visible' : ''}`}>
      <div className="reading-overlay" onClick={handleClose} />
      <div className="open-book" id="openBook">
        <button className="close-book" onClick={handleClose}>Close Book</button>

        <div className="book-page left">
          {hasPages && leftData
            ? <PageContent data={leftData} pageNum={pageIndex * 2 + 1} />
            : <PlaceholderLeft book={book} />
          }
        </div>

        <div className="book-center-spine" />

        <div className="book-page right">
          {hasPages && rightData
            ? <PageContent data={rightData} pageNum={pageIndex * 2 + 2} />
            : hasPages
              ? <EndPage />
              : <PlaceholderRight book={book} />
          }
        </div>

        <div className="page-flip-container" ref={flipContainerRef} />

        {totalPairs > 1 && (
          <div className="page-nav">
            <button onClick={prevPage}>&larr; Prev</button>
            <span className="current-page">{pageIndex + 1} / {totalPairs}</span>
            <button onClick={nextPage}>Next &rarr;</button>
          </div>
        )}
      </div>
    </div>
  )
}

function PageContent({ data, pageNum }: { data: BookPage; pageNum: number }) {
  if (data.type === 'toc') {
    return (
      <>
        <div className="reading-chapter">Table of Contents</div>
        <div className="reading-title">
          {data.title}
          {data.subtitle && (
            <>
              <br />
              <span style={{ fontSize: '0.65em', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink-light)' }}>
                {data.subtitle}
              </span>
            </>
          )}
        </div>
        <ul className="toc-list">
          {data.items?.map((item, i) => (
            <li key={i} className="toc-item">
              <span className="toc-label">{item}</span>
              <span className="toc-dots" />
              <span className="toc-page">{i * 2 + 3}</span>
            </li>
          ))}
        </ul>
        <span className="page-number">{pageNum}</span>
      </>
    )
  }

  return (
    <>
      {data.chapter && <div className="reading-chapter">{data.chapter}</div>}
      <div className="reading-subtitle">{data.title}</div>
      {data.text?.map((p, i) => (
        <p key={i} className="reading-text">{p}</p>
      ))}
      {data.code && <pre className="reading-code">{data.code}</pre>}
      {data.note && (
        <div className="reading-note">
          <div className="reading-note-label">Note</div>
          {data.note}
        </div>
      )}
      <span className="page-number">{pageNum}</span>
    </>
  )
}

function PlaceholderLeft({ book }: { book: Book }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <div style={{ width: 60, height: 3, background: 'var(--gold)', marginBottom: 32, opacity: 0.5 }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 12 }}>
        {book.title}
      </div>
      <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: 40 }}>
        {book.step}
      </div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: 'var(--ink-faded)', fontStyle: 'italic', maxWidth: 240, lineHeight: 1.7 }}>
        Developer Open Book<br />Archive Collection
      </div>
      <div style={{ width: 60, height: 3, background: 'var(--gold)', marginTop: 32, opacity: 0.5 }} />
      <span className="page-number">i</span>
    </div>
  )
}

function PlaceholderRight({ book }: { book: Book }) {
  return (
    <>
      <div className="reading-chapter">Preview</div>
      <div className="reading-title">콘텐츠 준비 중</div>
      <p className="reading-text">
        {book.title}의 전체 내용은 곧 추가될 예정입니다.
        현재 프리뷰에서는 Dart Step 01과 React Step 00의 샘플 콘텐츠를 제공합니다.
      </p>
      <div className="reading-note">
        <div className="reading-note-label">Tip</div>
        전체 콘텐츠가 포함된 책: <strong>Dart 기초 문법</strong> (Step 01), <strong>React 시작하기</strong> (Step 00)
      </div>
      <span className="page-number">ii</span>
    </>
  )
}

function EndPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--ink-faded)' }}>
      End of Preview
    </div>
  )
}
