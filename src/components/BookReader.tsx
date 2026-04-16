import { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { RouteConfig } from '../routes';

/* Vite glob import: all .md files as raw strings (lazy) */
const mdModules = import.meta.glob('../content/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

interface Props {
  route: RouteConfig;
  onClose: () => void;
}

export function BookReader({ route, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setContent(null);

    // Derive content file path from route path
    const slug = route.slug || route.path.replace(/^\//, '');
    const key = `../content/${slug}.md`;

    const loader = mdModules[key];
    if (loader) {
      loader().then((md) => {
        setContent(md);
        setLoading(false);
      });
    } else {
      setContent(`# ${route.title}\n\n이 문서의 콘텐츠를 불러올 수 없습니다.`);
      setLoading(false);
    }
  }, [route]);

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
