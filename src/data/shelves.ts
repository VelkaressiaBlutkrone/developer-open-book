export interface Shelf {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export const SHELVES: Shelf[] = [
  { id: 'dart', name: 'Dart', icon: '📘', color: '#1B4F72', sortOrder: 1 },
  { id: 'flutter', name: 'Flutter', icon: '📗', color: '#1a3a2a', sortOrder: 2 },
  { id: 'react', name: 'React', icon: '📙', color: '#935116', sortOrder: 3 },
  { id: 'spring', name: 'Spring Boot', icon: '📕', color: '#8B2635', sortOrder: 4 },
  { id: 'archive', name: 'Archive', icon: '📓', color: '#4a1942', sortOrder: 5 },
];

export function getShelfById(id: string): Shelf | undefined {
  return SHELVES.find(s => s.id === id);
}

export function getShelfLabel(id: string): string {
  return getShelfById(id)?.name || id;
}
