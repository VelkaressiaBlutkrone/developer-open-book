import { useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { useContent } from '../hooks/useContent';
import type { RouteConfig } from '../routes';

interface Props {
  route: RouteConfig;
  onClose: () => void;
}

export function BookReader({ route, onClose }: Props) {
  const slug = route.slug || route.path.replace(/^\//, '');
  const { content, loading } = useContent(slug);

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
        <div className="book-reader-body">
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
