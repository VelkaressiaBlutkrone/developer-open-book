export interface Book {
  id: string
  title: string
  step: string
  category: 'dart' | 'react'
  contentFile: string
}

export interface BookVisual {
  height: number
  thickness: number
  color: string
  coverColor: string
}
