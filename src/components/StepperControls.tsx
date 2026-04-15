interface StepperControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  stepLabel?: string;
  onNext: () => void;
  onPrev: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onGoto: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [
  { label: '0.5x', value: 3000 },
  { label: '1x', value: 1500 },
  { label: '2x', value: 750 },
  { label: '3x', value: 500 },
];

export function StepperControls({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  stepLabel,
  onNext,
  onPrev,
  onPlay,
  onPause,
  onReset,
  onGoto,
  onSpeedChange,
}: StepperControlsProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="stepper-controls">
      {/* Progress bar */}
      <div className="stepper-progress-track" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        onGoto(Math.round(ratio * (totalSteps - 1)));
      }}>
        <div className="stepper-progress-fill" style={{ width: `${progress}%` }} />
        <div className="stepper-progress-thumb" style={{ left: `${progress}%` }} />
      </div>

      {/* Control buttons */}
      <div className="stepper-buttons">
        <div className="stepper-nav">
          <button className="stepper-btn" onClick={onReset} title="처음으로 (Home)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 20H5M19 20V4M5 20V4" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="stepper-btn" onClick={onPrev} disabled={currentStep === 0} title="이전">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="stepper-btn stepper-btn-play" onClick={isPlaying ? onPause : onPlay} title="재생/일시정지 (Space)">
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button className="stepper-btn" onClick={onNext} disabled={currentStep === totalSteps - 1} title="다음">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Step counter */}
        <span className="stepper-counter">
          Step {currentStep + 1} / {totalSteps}
        </span>

        {/* Speed control */}
        <div className="stepper-speed">
          {SPEEDS.map(s => (
            <button
              key={s.value}
              className={`stepper-speed-btn ${speed === s.value ? 'active' : ''}`}
              onClick={() => onSpeedChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step label */}
      {stepLabel && (
        <div className="stepper-label">{stepLabel}</div>
      )}
    </div>
  );
}
