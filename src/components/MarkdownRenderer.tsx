import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'
import { InteractiveExcalidrawDiagram } from './InteractiveExcalidrawDiagram'

const customCodeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#1e1a14',
    margin: '16px 0',
    borderRadius: '4px',
    borderLeft: '3px solid #8a6508',
    fontSize: '12.5px',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: '#1e1a14',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12.5px',
  },
}

const BOX_DRAWING = /[├└─│┌┐┘┤┬┴┼→←↑↓╔╗╚╝║═╠╣╦╩╬▶▼●○◆◇■□▪▫⬤]/

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const content = String(children).replace(/\n$/, '')

    if (match) {
      return (
        <SyntaxHighlighter
          style={customCodeTheme}
          language={match[1]}
          PreTag="div"
        >
          {content}
        </SyntaxHighlighter>
      )
    }

    const isMultiline = content.includes('\n')
    const isAscii = isMultiline && BOX_DRAWING.test(content)

    if (isAscii) {
      return (
        <div className="ascii-diagram">
          <pre><code>{content}</code></pre>
        </div>
      )
    }

    if (isMultiline) {
      return (
        <SyntaxHighlighter
          style={customCodeTheme}
          language="text"
          PreTag="div"
        >
          {content}
        </SyntaxHighlighter>
      )
    }

    return (
      <code className="inline-code" {...props}>{children}</code>
    )
  },
  blockquote({ children }) {
    const text = extractText(children)
    const tipMatch = text.match(/^(💡|TIP|팁)\s*/i)
    const warnMatch = text.match(/^(⚠️|WARNING|주의|경고)\s*/i)
    const noteMatch = text.match(/^(📝|NOTE|참고|노트)\s*/i)

    let label = 'Note'
    if (tipMatch) label = 'Tip'
    else if (warnMatch) label = 'Warning'
    else if (noteMatch) label = 'Note'

    return (
      <div className={`reading-note ${label.toLowerCase()}`}>
        <div className="reading-note-label">{label}</div>
        {children}
      </div>
    )
  },
  a({ href, children, ...props }) {
    if (href?.startsWith('#')) {
      const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        const id = decodeURIComponent(href.slice(1))
        const target = document.getElementById(id)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      return <a href={href} onClick={handleClick} {...props}>{children}</a>
    }
    const isExternal = href?.startsWith('http')
    return (
      <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
        {children}
      </a>
    )
  },
  table({ children }) {
    return (
      <div className="table-wrapper">
        <table>{children}</table>
      </div>
    )
  },
  div({ node, children, ...props }: any) {
    const el = node as any;
    const diagramAttr = el?.properties?.['dataDiagram'];
    if (diagramAttr) {
      const steps = parseInt(el?.properties?.['dataSteps'] || '3', 10);
      const basePath = `/developer-open-book/diagrams/${diagramAttr}`;
      const rawDesc = el?.properties?.['dataDescriptions'] || '';
      const descriptions = rawDesc ? String(rawDesc).split('|') : [];
      return (
        <InteractiveExcalidrawDiagram
          basePath={basePath}
          totalSteps={steps}
          descriptions={descriptions}
          alt={String(el?.properties?.['dataAlt'] || 'Interactive diagram')}
        />
      );
    }
    return <div {...props}>{children}</div>;
  },
}

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children ?? '')
  }
  return ''
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
