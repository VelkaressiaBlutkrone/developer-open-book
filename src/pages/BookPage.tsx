import { useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useContent } from '../hooks/useContent';
import { routes } from '../routes';

export default function BookPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useScrollAnimation();

  const currentRoute = routes.find(r => r.path === location.pathname);
  const slug = currentRoute?.slug || location.pathname.replace(/^\//, '');
  const { content, loading, error } = useContent(slug);

  const shelfBooks = useMemo(() => {
    if (!currentRoute?.shelf) return [];
    return routes.filter(r => r.shelf === currentRoute.shelf);
  }, [currentRoute?.shelf]);

  const currentIndex = shelfBooks.findIndex(r => r.path === location.pathname);
  const prevBook = currentIndex > 0 ? shelfBooks[currentIndex - 1] : null;
  const nextBook = currentIndex < shelfBooks.length - 1 ? shelfBooks[currentIndex + 1] : null;

  const goPrev = useCallback(() => { if (prevBook) navigate(prevBook.path); }, [prevBook, navigate]);
  const goNext = useCallback(() => { if (nextBook) navigate(nextBook.path); }, [nextBook, navigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="loading error">{error}</div>;
  }

  return (
    <div className="doc-page-wrapper">
      <article className="doc-page">
        <MarkdownRenderer content={content || ''} />
        {shelfBooks.length > 1 && (
          <nav className="book-nav">
            <button className="book-nav-btn" onClick={goPrev} disabled={!prevBook}>
              {prevBook ? `← ${prevBook.title}` : ''}
            </button>
            <span className="book-nav-pos">{currentIndex + 1} / {shelfBooks.length}</span>
            <button className="book-nav-btn" onClick={goNext} disabled={!nextBook}>
              {nextBook ? `${nextBook.title} →` : ''}
            </button>
          </nav>
        )}
      </article>
      <TableOfContents content={content || ''} />
    </div>
  );
}
