import { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../hooks/useTheme';

// Register only used languages
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import groovy from 'react-syntax-highlighter/dist/esm/languages/prism/groovy';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import properties from 'react-syntax-highlighter/dist/esm/languages/prism/properties';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';

SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('jsonc', json);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('gradle', groovy);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('properties', properties);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('dockerfile', docker);
SyntaxHighlighter.registerLanguage('proguard', properties);

interface Props {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: Props) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        showLineNumbers
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
