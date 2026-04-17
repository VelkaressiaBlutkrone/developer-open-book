import { BOOKS } from '../data/books'
import type { UserProgress } from '../store/progress'

const DEFAULT_MAX_CHARS = 10_000

/**
 * Build a formatted book list, optionally filtered by category.
 * Completed books are marked with ✅.
 */
export function buildBookList(category: string | null, state: UserProgress): string {
  const books = category
    ? BOOKS.filter(b => b.category === category)
    : BOOKS

  const lines = books.map(book => {
    const progress = state.books[book.id]
    const done = progress?.completed ? '✅' : '⬜'
    return `${done} [${book.step}] ${book.title}`
  })

  return lines.join('\n')
}

/**
 * Build a one-line progress summary for the user.
 */
export function buildProgressSummary(state: UserProgress): string {
  const { booksCompleted, totalTimeMs } = state.totals
  const { current: streakCurrent } = state.streak
  const totalBooks = BOOKS.length
  const totalMinutes = Math.round(totalTimeMs / 60_000)
  return `완료: ${booksCompleted}/${totalBooks}권 | 연속 학습: ${streakCurrent}일 | 총 학습 시간: ${totalMinutes}분`
}

/**
 * Trim markdown content to maxChars, appending a suffix if truncated.
 */
export function trimMarkdown(content: string, maxChars: number = DEFAULT_MAX_CHARS): string {
  if (content.length <= maxChars) return content
  return content.slice(0, maxChars) + '\n\n... (이하 생략)'
}

/**
 * Fetch the markdown content for a book and trim it.
 */
export async function fetchCurrentBookContent(bookId: string): Promise<string> {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) return ''

  try {
    const res = await fetch(book.contentFile)
    if (!res.ok) return ''
    const text = await res.text()
    return trimMarkdown(text)
  } catch {
    return ''
  }
}

/**
 * Get the most recently read book ID from user progress.
 */
export function getLastReadBookId(state: UserProgress): string | null {
  let latestId: string | null = null
  let latestTs = 0

  for (const [bookId, progress] of Object.entries(state.books)) {
    if (progress.lastReadAt > latestTs) {
      latestTs = progress.lastReadAt
      latestId = bookId
    }
  }

  return latestId
}
