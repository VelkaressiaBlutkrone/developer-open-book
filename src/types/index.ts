export interface BookPage {
  type: 'toc' | 'content'
  title: string
  subtitle?: string
  chapter?: string
  items?: string[]
  text?: string[]
  code?: string
  note?: string | null
}

export interface Book {
  id: string
  title: string
  step: string
  category: 'dart' | 'react'
  pages: BookPage[]
}

export interface BookVisual {
  height: number
  thickness: number
  color: string
  coverColor: string
}
