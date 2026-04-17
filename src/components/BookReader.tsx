import { useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { useContent } from '../hooks/useContent';
import { useProgress } from '../store/ProgressContext';
import { BOOKS } from '../data/books';
import type { RouteConfig } from '../routes';

interface Props {
  route: RouteConfig;
  onClose: () => void;
}

export function BookReader({ route, onClose }: Props) {
  const slug = route.slug || route.path.replace(/^\//, '');
  const { content, loading } = useContent(slug);
  const { trackScroll, trackTime, checkCompletion } = useProgress();
  const book = BOOKS.find(b => b.slug === slug);
  const lastTick = useRef(Date.now());
  const bodyRef = useRef<HTMLDivElement>(null);

  // Reading time tracker
  useEffect(() => {
    if (!book) return;
    lastTick.current = Date.now();
    const interval = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      trackTime(book.id, Math.min(delta, 10_000));
    }, 5_000);
    return () => clearInterval(interval);
  }, [book, trackTime]);

  // Scroll tracking inside reader body
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !book) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      if (max <= 0) return;
      trackScroll(book.id, Math.min(1, scrollTop / max));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [book, trackScroll]);

  // Check completion
  useEffect(() => {
    if (!book || !content) return;
    const timer = setTimeout(() => checkCompletion(book.id, content), 2_000);
    return () => clearTimeout(timer);
  }, [book, content, checkCompletion]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="book-reader-overlay" onClick={onClose}>
      <div className="book-reader" onClick={(e) => e.stopPropagation()}>
        <div className="book-reader-header">
          <h2 className="book-reader-title">{route.title}</h2>
          <button className="book-reader-close" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>
        <div className="book-reader-body" ref={bodyRef}>
          {loading ? (
            <div className="book-reader-loading">Loading...</div>
          ) : content ? (
            <article className="markdown-body">
              <MarkdownRenderer content={content} />
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}
