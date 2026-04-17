import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { ScrollProgress } from './ScrollProgress';
import { BackToTop } from './BackToTop';
import { ProgressIndicator } from './ProgressIndicator';
import { PixelDiorama } from './PixelDiorama';
import { routes } from '../routes';
import { getShelfLabel } from '../data/shelves';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '';

  const currentRoute = routes.find(r => r.path === location.pathname);
  const currentShelf = currentRoute?.shelf;
  const shelfLabel = currentShelf ? getShelfLabel(currentShelf) : '';

  /* Home = full-screen library room, no header/sidebar */
  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout library-theme">
      <ScrollProgress />
      <PixelDiorama />
      <header className="app-header">
        <div className="header-left">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h1
            className="site-title library-title"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            Developer Open Book
          </h1>
        </div>
        <div className="header-right">
          <ProgressIndicator />
          <SearchBar />
          <ThemeToggle />
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button className="breadcrumb-item breadcrumb-home" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L2 9h3v7h4v-5h2v5h4V9h3L10 2z"/></svg>
          <span>도서관</span>
        </button>
        {shelfLabel && (
          <>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item">{shelfLabel}</span>
          </>
        )}
        {currentRoute && currentRoute.title && (
          <>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item breadcrumb-current">{currentRoute.title}</span>
          </>
        )}
      </nav>

      <div className="app-body">
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} shelf={currentShelf} />
        </aside>
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <main className="app-content">
          {children}
        </main>
      </div>
      <BackToTop />
    </div>
  );
}
