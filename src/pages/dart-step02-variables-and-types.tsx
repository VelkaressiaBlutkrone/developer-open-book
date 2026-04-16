import content from '../content/dart-step02-variables-and-types.md?raw';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Page() {
  useScrollAnimation();
  return (
    <div className="doc-page-wrapper">
      <article className="doc-page">
        <MarkdownRenderer content={content} />
      </article>
      <TableOfContents content={content} />
    </div>
  );
}
