import { useState, useEffect, useRef, useCallback } from 'react';
import { useStepSimulator } from '../hooks/useStepSimulator';
import { StepperControls } from './StepperControls';

interface Props {
  /** Base path for step SVG files (without step number and extension) */
  basePath: string;
  /** Total number of steps */
  totalSteps: number;
  /** Step descriptions shown below the controls */
  descriptions?: string[];
  /** Alt text for the diagram */
  alt?: string;
}

/**
 * Interactive diagram that cycles through Excalidraw SVG images per step.
 * Each step is a separate SVG file: {basePath}-step{N}.svg
 */
export function InteractiveExcalidrawDiagram({
  basePath,
  totalSteps,
  descriptions = [],
  alt = 'Interactive diagram',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedSteps, setLoadedSteps] = useState<Set<number>>(new Set([0]));
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const sim = useStepSimulator({
    totalSteps,
    defaultSpeed: 1500,
  });

  // Preload next step image
  useEffect(() => {
    const nextStep = sim.currentStep + 1;
    if (nextStep < totalSteps && !loadedSteps.has(nextStep)) {
      const img = new Image();
      img.src = `${basePath}-step${nextStep + 1}.svg`;
      img.onload = () => {
        setLoadedSteps(prev => new Set(prev).add(nextStep));
      };
    }
  }, [sim.currentStep, basePath, totalSteps, loadedSteps]);

  // Keyboard events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => sim.handleKeyDown(e as KeyboardEvent);
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [sim.handleKeyDown]);

  const stepLabel = descriptions[sim.currentStep] || '';

  return (
    <div className="interactive-diagram" ref={containerRef} tabIndex={0}>
      <div className="interactive-excalidraw-canvas">
        <button
          className="diagram-fullscreen-btn"
          onClick={toggleFullscreen}
          aria-label="전체 화면"
        >
          {isFullscreen ? '\u229F' : '\u229E'}
        </button>
        {/* Render all steps, show only current with fade */}
        {Array.from({ length: totalSteps }, (_, i) => (
          <img
            key={i}
            src={`${basePath}-step${i + 1}.svg`}
            alt={i === sim.currentStep ? alt : ''}
            className={`excalidraw-step-img ${i === sim.currentStep ? 'active' : ''}`}
            loading={i <= 1 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {totalSteps > 1 && (
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
