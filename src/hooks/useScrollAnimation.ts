import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = document.querySelectorAll(
      '.markdown-body h1, .markdown-body h2, .markdown-body h3, ' +
      '.code-block, .ascii-diagram, .table-wrapper, .md-blockquote, .md-figure'
    );

    targets.forEach((el, i) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.animationDelay = `${i * 30}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}
