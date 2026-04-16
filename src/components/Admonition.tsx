import { type ReactNode } from 'react';

type AdmonitionType = 'note' | 'tip' | 'warning' | 'info' | 'prerequisite';

const CONFIG: Record<AdmonitionType, { icon: string; label: string }> = {
  note: { icon: '\u{1F4DD}', label: '\uCC38\uACE0' },
  tip: { icon: '\u{1F4A1}', label: '\uD301' },
  warning: { icon: '\u26A0\uFE0F', label: '\uC8FC\uC758' },
  info: { icon: '\u2139\uFE0F', label: '\uC815\uBCF4' },
  prerequisite: { icon: '\u{1F4DA}', label: '\uC804\uC81C \uC9C0\uC2DD' },
};

interface Props {
  type: AdmonitionType;
  children: ReactNode;
}

export function Admonition({ type, children }: Props) {
  const { icon, label } = CONFIG[type];
  return (
    <div className={`admonition admonition-${type}`}>
      <div className="admonition-header">
        <span className="admonition-icon">{icon}</span>
        <span className="admonition-label">{label}</span>
      </div>
      <div className="admonition-content">{children}</div>
    </div>
  );
}
