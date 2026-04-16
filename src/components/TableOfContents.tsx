import { useState, useEffect, useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  content: string;
}

function parseHeadings(md: string): TocItem[] {
  return md
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (!match) return null;
      const level = match[1].length;
      const raw = match[2].replace(/[*`\[\]()]/g, '').trim();
      const id = raw
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-|-$/g, '');
      return { id, text: raw, level };
    })
    .filter(Boolean) as TocItem[];
}

export function TableOfContents({ content }: Props) {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (headings.length < 3) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-80px 0px -75% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="toc-floating" aria-label="목차">
      <h4 className="toc-title">목차</h4>
      <ul className="toc-list">
        {headings.map((h) => (
          <li key={h.id} className={`toc-item toc-level-${h.level}`}>
            <a
              href={`#${h.id}`}
              className={activeId === h.id ? 'toc-active' : ''}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
