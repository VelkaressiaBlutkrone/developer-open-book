import { useReducer, useEffect, useCallback, useRef } from 'react';

interface StepState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  isComplete: boolean;
}

type StepAction =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; step: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'RESET' }
  | { type: 'SET_TOTAL'; total: number };

function stepReducer(state: StepState, action: StepAction): StepState {
  switch (action.type) {
    case 'NEXT': {
      const next = state.currentStep + 1;
      if (next >= state.totalSteps) {
        return { ...state, currentStep: state.totalSteps - 1, isPlaying: false, isComplete: true };
      }
      return { ...state, currentStep: next, isComplete: false };
    }
    case 'PREV':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0), isComplete: false };
    case 'GOTO':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.step, state.totalSteps - 1)),
        isComplete: action.step >= state.totalSteps - 1,
      };
    case 'PLAY':
      return { ...state, isPlaying: true, isComplete: false };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'RESET':
      return { ...state, currentStep: 0, isPlaying: false, isComplete: false };
    case 'SET_TOTAL':
      return { ...state, totalSteps: action.total };
    default:
      return state;
  }
}

interface UseStepSimulatorOptions {
  totalSteps: number;
  defaultSpeed?: number;
  autoPlay?: boolean;
}

export function useStepSimulator({
  totalSteps,
  defaultSpeed = 1500,
  autoPlay = false,
}: UseStepSimulatorOptions) {
  const [state, dispatch] = useReducer(stepReducer, {
    currentStep: 0,
    totalSteps,
    isPlaying: autoPlay,
    speed: defaultSpeed,
    isComplete: false,
  });

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    dispatch({ type: 'SET_TOTAL', total: totalSteps });
  }, [totalSteps]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= state.speed) {
        lastTickRef.current = timestamp;
        dispatch({ type: 'NEXT' });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.isPlaying, state.speed]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key) {
      case 'ArrowRight': dispatch({ type: 'NEXT' }); break;
      case 'ArrowLeft': dispatch({ type: 'PREV' }); break;
      case ' ':
        e.preventDefault();
        dispatch(state.isPlaying ? { type: 'PAUSE' } : { type: 'PLAY' });
        break;
      case 'Home': dispatch({ type: 'RESET' }); break;
      case 'End': dispatch({ type: 'GOTO', step: state.totalSteps - 1 }); break;
    }
  }, [state.isPlaying, state.totalSteps]);

  return {
    ...state,
    dispatch,
    next: () => dispatch({ type: 'NEXT' }),
    prev: () => dispatch({ type: 'PREV' }),
    goto: (step: number) => dispatch({ type: 'GOTO', step }),
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    toggle: () => dispatch(state.isPlaying ? { type: 'PAUSE' } : { type: 'PLAY' }),
    reset: () => dispatch({ type: 'RESET' }),
    setSpeed: (speed: number) => dispatch({ type: 'SET_SPEED', speed }),
    handleKeyDown,
  };
}
