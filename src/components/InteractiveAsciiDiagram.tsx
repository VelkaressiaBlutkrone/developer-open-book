import { useEffect, useRef, useMemo } from 'react';
import { useStepSimulator } from '../hooks/useStepSimulator';
import { StepperControls } from './StepperControls';

interface Props {
  code: string;
  stepDescriptions?: string[];
}

interface AsciiRegion {
  type: 'box' | 'arrow' | 'text';
  lineStart: number;
  lineEnd: number;
  content: string;
}

function parseAsciiRegions(code: string): AsciiRegion[] {
  const lines = code.split('\n');
  const regions: AsciiRegion[] = [];
  let boxStart = -1;
  let boxContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/[┌╔┏]/.test(line) && boxStart === -1) {
      boxStart = i;
      boxContent = '';
    }

    if (boxStart !== -1) {
      const textMatch = line.match(/[│║┃]\s*(.+?)\s*[│║┃]/);
      if (textMatch) boxContent += textMatch[1] + ' ';
    }

    if (/[└╚┗]/.test(line) && boxStart !== -1) {
      regions.push({
        type: 'box',
        lineStart: boxStart,
        lineEnd: i,
        content: boxContent.trim(),
      });
      boxStart = -1;
      continue;
    }

    // Arrow lines (outside boxes)
    if (boxStart === -1 && /[→▶►↓▼←◄↑▲│|]/.test(line) && line.trim().length < 40) {
      regions.push({
        type: 'arrow',
        lineStart: i,
        lineEnd: i,
        content: line.trim(),
      });
    }
  }

  // Fallback: group by 3 lines if no regions found
  if (regions.length === 0) {
    const nonEmpty = lines
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => line.trim().length > 0);

    for (let g = 0; g < nonEmpty.length; g += 3) {
      const group = nonEmpty.slice(g, g + 3);
      regions.push({
        type: 'text',
        lineStart: group[0].i,
        lineEnd: group[group.length - 1].i,
        content: group.map(x => x.line).join('\n'),
      });
    }
  }

  return regions;
}

export function InteractiveAsciiDiagram({ code, stepDescriptions }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const regions = useMemo(() => parseAsciiRegions(code), [code]);
  const lines = useMemo(() => code.split('\n'), [code]);

  const sim = useStepSimulator({
    totalSteps: Math.max(regions.length, 1),
    defaultSpeed: 1500,
  });

  // Keyboard events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => sim.handleKeyDown(e as KeyboardEvent);
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [sim.handleKeyDown]);

  // Compute line states
  const lineStates = useMemo(() => {
    const states: ('active' | 'completed' | 'dimmed')[] = new Array(lines.length).fill('dimmed');

    regions.forEach((region, regionIdx) => {
      for (let l = region.lineStart; l <= region.lineEnd; l++) {
        if (regionIdx === sim.currentStep) {
          states[l] = 'active';
        } else if (regionIdx < sim.currentStep) {
          states[l] = 'completed';
        }
      }
    });

    return states;
  }, [regions, sim.currentStep, lines.length]);

  const stepLabel = stepDescriptions?.[sim.currentStep]
    || regions[sim.currentStep]?.content
    || '';

  return (
    <div className="interactive-diagram" ref={containerRef} tabIndex={0}>
      <div className="interactive-ascii-canvas">
        <pre className="interactive-ascii-pre">
          {lines.map((line, i) => (
            <span
              key={i}
              className={`ascii-line ascii-line-${lineStates[i]}`}
            >
              {line}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
      {regions.length > 1 && (
        <StepperControls
          currentStep={sim.currentStep}
          totalSteps={sim.totalSteps}
          isPlaying={sim.isPlaying}
          speed={sim.speed}
          stepLabel={stepLabel}
          onNext={sim.next}
          onPrev={sim.prev}
          onPlay={sim.play}
          onPause={sim.pause}
          onReset={sim.reset}
          onGoto={sim.goto}
          onSpeedChange={sim.setSpeed}
        />
      )}
    </div>
  );
}
