import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';
import searchIndex from '../search-index.json';

interface SearchItem {
  path: string;
  title: string;
  content: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex as SearchItem[], {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'content', weight: 1 },
        ],
        threshold: 0.3,
        includeMatches: true,
      }),
    []
  );

  const results = query.trim() ? fuse.search(query).slice(0, 8) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx].item.path);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setSelectedIdx(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((r, i) => (
            <li
              key={r.item.path}
              className={i === selectedIdx ? 'selected' : ''}
              onClick={() => handleSelect(r.item.path)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="result-title">{r.item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
