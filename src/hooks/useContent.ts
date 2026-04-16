import { useState, useEffect } from 'react';
import { BOOKS } from '../data/books';

export function useContent(slug: string | undefined) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setContent(null);
      setLoading(false);
      setError('No slug provided');
      return;
    }

    setLoading(true);
    setContent(null);
    setError(null);

    const book = BOOKS.find(b => b.slug === slug);
    if (!book) {
      setError('Book not found');
      setLoading(false);
      return;
    }

    fetch(book.contentFile)
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.text();
      })
      .then(md => {
        setContent(md);
        setLoading(false);
      })
      .catch(err => {
        setError(`콘텐츠를 불러올 수 없습니다 (${err.message})`);
        setContent(null);
        setLoading(false);
      });
  }, [slug]);

  return { content, loading, error };
}
