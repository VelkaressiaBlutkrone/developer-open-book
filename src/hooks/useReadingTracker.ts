import { useEffect, useRef } from 'react'
import { useProgress } from '../store/ProgressContext'

/**
 * Tracks scroll position and reading time for a book.
 * Attach to the page/reader that displays book content.
 */
export function useReadingTracker(
  bookId: string | undefined,
  content: string | null,
) {
  const { trackScroll, trackTime, checkCompletion } = useProgress()
  const lastTick = useRef(Date.now())

  // Track reading time via periodic ticks (every 5s while visible)
  useEffect(() => {
    if (!bookId) return

    lastTick.current = Date.now()

    const interval = setInterval(() => {
      if (document.hidden) return
      const now = Date.now()
      const delta = now - lastTick.current
      lastTick.current = now
      // Cap single tick at 10s to avoid counting away-from-tab time
      trackTime(bookId, Math.min(delta, 10_000))
    }, 5_000)

    return () => clearInterval(interval)
  }, [bookId, trackTime])

  // Track scroll position
  useEffect(() => {
    if (!bookId) return

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (docHeight <= 0) return
      const ratio = Math.min(1, scrollTop / docHeight)
      trackScroll(bookId, ratio)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [bookId, trackScroll])

  // Check completion when content or scroll updates
  useEffect(() => {
    if (!bookId || !content) return
    // Debounce: check completion after scroll settles
    const timer = setTimeout(() => {
      checkCompletion(bookId, content)
    }, 2_000)
    return () => clearTimeout(timer)
  }, [bookId, content, checkCompletion])
}
