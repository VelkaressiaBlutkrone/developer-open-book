export type BookCategory = 'dart' | 'flutter' | 'react' | 'spring' | 'archive';

export interface Book {
  id: string
  title: string
  step: string
  category: BookCategory
  contentFile: string
  slug: string
}

export interface BookVisual {
  height: number
  thickness: number
  color: string
  coverColor: string
}
