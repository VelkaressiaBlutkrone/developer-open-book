export interface Book {
  id: string
  title: string
  step: string
  category: 'dart' | 'flutter' | 'react'
  contentFile: string
}

export interface BookVisual {
  height: number
  thickness: number
  color: string
  coverColor: string
}
