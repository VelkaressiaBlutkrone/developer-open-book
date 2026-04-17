import { describe, it, expect } from 'vitest'
import {
  BOOKS,
  getBookBySlug,
  getBooksByShelf,
  getBookVisual,
  SPINE_COLORS,
  seedFromId,
} from './books'

describe('BOOKS registry', () => {
  it('has entries', () => {
    expect(BOOKS.length).toBeGreaterThan(0)
  })

  it('every book has required fields', () => {
    for (const book of BOOKS) {
      expect(book.id).toBeTruthy()
      expect(book.title).toBeTruthy()
      expect(book.slug).toBeTruthy()
      expect(book.category).toBeTruthy()
      expect(book.contentFile).toBeTruthy()
    }
  })

  it('slugs are unique', () => {
    const slugs = BOOKS.map(b => b.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('ids are unique', () => {
    const ids = BOOKS.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getBookBySlug', () => {
  it('finds existing book', () => {
    const book = getBookBySlug('dart-step01-overview-and-setup')
    expect(book).toBeDefined()
    expect(book!.id).toBe('dart-01')
  })

  it('returns undefined for nonexistent slug', () => {
    expect(getBookBySlug('nonexistent-slug')).toBeUndefined()
  })
})

describe('getBooksByShelf', () => {
  it('returns dart books', () => {
    const dartBooks = getBooksByShelf('dart')
    expect(dartBooks.length).toBeGreaterThan(0)
    expect(dartBooks.every(b => b.category === 'dart')).toBe(true)
  })

  it('returns flutter books', () => {
    const flutterBooks = getBooksByShelf('flutter')
    expect(flutterBooks.length).toBeGreaterThan(0)
    expect(flutterBooks.every(b => b.category === 'flutter')).toBe(true)
  })

  it('returns react books', () => {
    const reactBooks = getBooksByShelf('react')
    expect(reactBooks.length).toBeGreaterThan(0)
    expect(reactBooks.every(b => b.category === 'react')).toBe(true)
  })

  it('returns empty for nonexistent shelf', () => {
    expect(getBooksByShelf('java')).toEqual([])
  })
})

describe('getBookVisual', () => {
  it('returns visual properties', () => {
    const visual = getBookVisual('dart-01')
    expect(visual.height).toBe(200)
    expect(visual.thickness).toBeGreaterThanOrEqual(26)
    expect(visual.thickness).toBeLessThanOrEqual(47)
    expect(visual.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(visual.coverColor).toMatch(/^rgb\(/)
  })

  it('returns consistent results for same id', () => {
    const a = getBookVisual('flutter-01')
    const b = getBookVisual('flutter-01')
    expect(a).toEqual(b)
  })

  it('color is from SPINE_COLORS palette', () => {
    const visual = getBookVisual('react-01')
    expect(SPINE_COLORS).toContain(visual.color)
  })
})

describe('seedFromId', () => {
  it('returns non-negative number', () => {
    expect(seedFromId('test')).toBeGreaterThanOrEqual(0)
  })

  it('is deterministic', () => {
    expect(seedFromId('hello')).toBe(seedFromId('hello'))
  })

  it('differs for different inputs', () => {
    expect(seedFromId('abc')).not.toBe(seedFromId('xyz'))
  })
})
