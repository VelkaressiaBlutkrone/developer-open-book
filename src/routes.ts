import { lazy, type ComponentType } from 'react';
import { BOOKS } from './data/books';

export interface RouteConfig {
  path: string;
  title: string;
  component: ComponentType;
  category: string;
  /** Which library shelf this belongs to */
  shelf?: string;
  /** Content file slug (filename without .md) */
  slug?: string;
}

const BookPage = lazy(() => import('./pages/BookPage'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    title: 'Developer Open Book',
    component: lazy(() => import('./pages/index')),
    category: 'Home',
  },
  ...BOOKS.map(book => ({
    path: `/${book.slug}`,
    title: book.title,
    component: BookPage,
    category: book.category,
    shelf: book.category,
    slug: book.slug,
  })),
];
