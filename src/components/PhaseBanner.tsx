import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function PhaseBanner({ children }: Props) {
  return (
    <div className="phase-banner">
      <div className="phase-banner-content">{children}</div>
    </div>
  );
}
