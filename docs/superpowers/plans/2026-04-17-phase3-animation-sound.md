# Phase 3: Animation + Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Canvas 먼지 파티클, NPC 시간대별 이동, 8bit 효과음, 앰비언트 배경음, 픽셀아트 RPG 이벤트 이펙트를 추가하여 도서관에 생명을 불어넣는다.

**Architecture:** DustCanvas(Canvas 렌더 루프)가 파티클 + 이벤트 이펙트를 담당. synth.ts가 Web Audio API로 8bit 사운드 합성. SoundContext가 전역 사운드 상태를 관리. npcs.ts의 schedule 필드로 시간대별 NPC 위치를 결정.

**Tech Stack:** React 19, TypeScript, Canvas API, Web Audio API, CSS animations

**Spec:** `docs/superpowers/specs/2026-04-17-phase3-animation-sound-design.md`

---

## File Structure

### New Files
```
src/components/DustCanvas.tsx       — Canvas 먼지 파티클 + celebrateEffect
src/audio/synth.ts                  — Web Audio API 8bit 효과음 합성 (5개)
src/audio/SoundContext.tsx          — 사운드 상태 관리 (muted/effects/full)
src/components/SoundToggle.tsx      — 헤더 스피커 토글 버튼
public/audio/ambient-library.mp3    — 앰비언트 배경음 (CC0 또는 합성 fallback)
```

### Modified Files
```
src/data/npcs.ts                    — NPCSchedule 타입 + schedule 데이터 + getTimeOfDay
src/components/LibraryRoom.tsx      — DustCanvas, 시간대별 NPC, 사운드 트리거
src/store/ProgressContext.tsx       — 배지/완독 시 사운드 + 이펙트 트리거
src/components/Layout.tsx           — SoundToggle 추가
src/App.tsx                         — SoundProvider 래핑
src/index.css                       — 촛불 강화, NPC sway, 플래시, 스트릭 펄스
```

---

## Task 1: 8bit 효과음 합성기

**Files:**
- Create: `src/audio/synth.ts`

- [ ] **Step 1: Create synth.ts with 5 sound functions**

Create `src/audio/synth.ts`:

```typescript
let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = volume
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

function playSequence(notes: [number, number][], type: OscillatorType = 'square', volume = 0.15) {
  const ctx = getCtx()
  let time = ctx.currentTime
  for (const [freq, dur] of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + dur)
    time += dur * 0.8
  }
}

// C5=523, D5=587, E5=659, G5=784, A5=880, C6=1047

export function playBookOpen() {
  playSequence([[523, 0.08], [659, 0.1]])
}

export function playNpcTalk() {
  playTone(392, 0.08, 'sine', 0.1)
}

export function playQuestAccept() {
  playSequence([[523, 0.1], [659, 0.1], [784, 0.15]])
}

export function playQuestComplete() {
  playSequence([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.2]])
}

export function playBadgeEarn() {
  playSequence([[880, 0.08], [1047, 0.08], [880, 0.08], [1047, 0.12]], 'triangle')
}

export type SoundName = 'bookOpen' | 'npcTalk' | 'questAccept' | 'questComplete' | 'badgeEarn'

const SOUND_MAP: Record<SoundName, () => void> = {
  bookOpen: playBookOpen,
  npcTalk: playNpcTalk,
  questAccept: playQuestAccept,
  questComplete: playQuestComplete,
  badgeEarn: playBadgeEarn,
}

export function playSound(name: SoundName) {
  SOUND_MAP[name]?.()
}
```

- [ ] **Step 2: Run build to verify no errors**

Run: `npx tsc -b`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/audio/synth.ts
git commit -m "feat: 8bit 효과음 합성기 — 5개 사운드 (Web Audio API)"
```

---

## Task 2: SoundContext + SoundToggle

**Files:**
- Create: `src/audio/SoundContext.tsx`
- Create: `src/components/SoundToggle.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Create SoundContext**

Create `src/audio/SoundContext.tsx`:

```typescript
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { playSound, type SoundName } from './synth'

export type SoundMode = 'muted' | 'effects' | 'full'

interface SoundAPI {
  mode: SoundMode
  setMode: (mode: SoundMode) => void
  play: (name: SoundName) => void
}

const STORAGE_KEY = 'dev-open-book-sound'
const SoundContext = createContext<SoundAPI | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SoundMode>(() => {
    try { return (localStorage.getItem(STORAGE_KEY) as SoundMode) || 'muted' } catch { return 'muted' }
  })
  const ambientRef = useRef<HTMLAudioElement | null>(null)

  const setMode = useCallback((m: SoundMode) => {
    setModeState(m)
    localStorage.setItem(STORAGE_KEY, m)
  }, [])

  const play = useCallback((name: SoundName) => {
    if (mode === 'muted') return
    playSound(name)
  }, [mode])

  // Ambient audio management
  useEffect(() => {
    if (mode === 'full') {
      if (!ambientRef.current) {
        const audio = new Audio(import.meta.env.BASE_URL + 'audio/ambient-library.mp3')
        audio.loop = true
        audio.volume = 0.15
        ambientRef.current = audio
      }
      ambientRef.current.play().catch(() => {})
    } else {
      ambientRef.current?.pause()
    }
  }, [mode])

  // Pause on visibility change
  useEffect(() => {
    const handler = () => {
      if (document.hidden) ambientRef.current?.pause()
      else if (mode === 'full') ambientRef.current?.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [mode])

  return (
    <SoundContext.Provider value={{ mode, setMode, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound(): SoundAPI {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
```

- [ ] **Step 2: Create SoundToggle component**

Create `src/components/SoundToggle.tsx`:

```typescript
import { useSound, type SoundMode } from '../audio/SoundContext'

const ICONS: Record<SoundMode, string> = {
  muted: '🔇',
  effects: '🔊',
  full: '🎵',
}

const NEXT: Record<SoundMode, SoundMode> = {
  muted: 'effects',
  effects: 'full',
  full: 'muted',
}

const LABELS: Record<SoundMode, string> = {
  muted: '소리 끔',
  effects: '효과음만',
  full: '전체 소리',
}

export function SoundToggle() {
  const { mode, setMode } = useSound()

  return (
    <button
      className="sound-toggle"
      onClick={() => setMode(NEXT[mode])}
      aria-label={LABELS[mode]}
      title={LABELS[mode]}
    >
      {ICONS[mode]}
    </button>
  )
}
```

- [ ] **Step 3: Wrap App with SoundProvider**

In `src/App.tsx`, add `SoundProvider` wrapping inside `ProgressProvider`:

```typescript
import { SoundProvider } from './audio/SoundContext';

// In the return:
<ProgressProvider>
  <SoundProvider>
    <Layout>...</Layout>
  </SoundProvider>
</ProgressProvider>
```

- [ ] **Step 4: Add SoundToggle to Layout.tsx header**

In `src/components/Layout.tsx`, import `SoundToggle` and add it next to `ThemeToggle`:

```typescript
import { SoundToggle } from './SoundToggle';

// In header-right div:
<SoundToggle />
<ThemeToggle />
```

- [ ] **Step 5: Add SoundToggle to LibraryRoom lr-progress area**

In `src/components/LibraryRoom.tsx`, add `SoundToggle` next to `ProgressIndicator`:

```typescript
import { SoundToggle } from './SoundToggle';

// In lr-progress div:
<div className="lr-progress">
  <SoundToggle />
  <ProgressIndicator />
</div>
```

- [ ] **Step 6: Add CSS for SoundToggle**

In `src/index.css`:

```css
.sound-toggle {
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.sound-toggle:hover {
  border-color: var(--accent);
}
```

- [ ] **Step 7: Run build to verify**

Run: `npm run build`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/audio/SoundContext.tsx src/components/SoundToggle.tsx src/App.tsx src/components/Layout.tsx src/components/LibraryRoom.tsx src/index.css
git commit -m "feat: 사운드 시스템 — SoundContext + SoundToggle (muted/effects/full)"
```

---

## Task 3: 사운드 트리거 연결

**Files:**
- Modify: `src/components/LibraryRoom.tsx`
- Modify: `src/store/ProgressContext.tsx`

- [ ] **Step 1: Add sound triggers to LibraryRoom**

Import `useSound` and add play calls:

- Shelf click (ShelfModal open): `play('bookOpen')`
- NPC click (handleNPCClick): `play('npcTalk')`
- Quest accept (give_quest action): `play('questAccept')`
- Quest complete (complete_quest action): `play('questComplete')`

- [ ] **Step 2: Add sound triggers to ProgressContext**

In `setState`, after checking new badges:

```typescript
// After: if (newBadges.length > 0)
// Cannot call useSound here (not a hook), so expose a callback registration
```

Alternative: trigger badge sound from LibraryRoom when badge count changes. Add a `useEffect` that watches `state.badges.length` and plays `badgeEarn` when it increases.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/LibraryRoom.tsx src/store/ProgressContext.tsx
git commit -m "feat: 사운드 트리거 — 책/NPC/퀘스트/배지 이벤트 연결"
```

---

## Task 4: DustCanvas 먼지 파티클

**Files:**
- Create: `src/components/DustCanvas.tsx`
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Create DustCanvas component**

Create `src/components/DustCanvas.tsx`:

```typescript
import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; alpha: number
  life: number; maxLife: number
}

interface CelebrateParticle extends Particle {
  color: string
}

export interface DustCanvasRef {
  celebrate: (x: number, y: number) => void
}

const MAX_DUST = 60
const MOBILE_MAX = 30

export const DustCanvas = forwardRef<DustCanvasRef>(function DustCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dustRef = useRef<Particle[]>([])
  const celebrateRef = useRef<CelebrateParticle[]>([])
  const rafRef = useRef<number>(0)

  const celebrate = useCallback((x: number, y: number) => {
    for (let i = 0; i < 5; i++) {
      celebrateRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4 - 1,
        size: 3,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        color: ['#f5c542', '#ff6b35', '#fff'][Math.floor(Math.random() * 3)],
      })
    }
  }, [])

  useImperativeHandle(ref, () => ({ celebrate }), [celebrate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init dust
    const max = window.innerWidth < 768 ? MOBILE_MAX : MAX_DUST
    dustRef.current = Array.from({ length: max }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.2 + 0.05),
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.3 + 0.1,
      life: 0,
      maxLife: Infinity,
    }))

    const loop = () => {
      if (document.hidden) { rafRef.current = requestAnimationFrame(loop); return }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dust particles
      for (const p of dustRef.current) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10 || p.x > canvas.width + 10) p.x = Math.random() * canvas.width

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 220, 150, ${p.alpha})`
        ctx.fill()
      }

      // Celebrate particles
      celebrateRef.current = celebrateRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1 // gravity
        p.life++
        const progress = p.life / p.maxLife
        p.alpha = 1 - progress

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        // Pixel star shape (small rect)
        ctx.fillRect(p.x - 1, p.y - 1, 3, 3)
        ctx.fillRect(p.x, p.y - 2, 1, 5)
        ctx.fillRect(p.x - 2, p.y, 5, 1)
        ctx.globalAlpha = 1

        return p.life < p.maxLife
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="dust-canvas"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}
    />
  )
})
```

- [ ] **Step 2: Add DustCanvas to LibraryRoom**

In `src/components/LibraryRoom.tsx`:

```typescript
import { DustCanvas, type DustCanvasRef } from './DustCanvas';

// In component:
const dustRef = useRef<DustCanvasRef>(null);

// Before lr-vignette:
<DustCanvas ref={dustRef} />
```

- [ ] **Step 3: Run build + screenshot**

Run: `npm run build`
Take screenshot to verify dust particles appear.

- [ ] **Step 4: Commit**

```bash
git add src/components/DustCanvas.tsx src/components/LibraryRoom.tsx
git commit -m "feat: DustCanvas 먼지 파티클 — Canvas 기반 50~60개 부유 파티클"
```

---

## Task 5: NPC 시간대별 이동

**Files:**
- Modify: `src/data/npcs.ts`
- Modify: `src/components/LibraryRoom.tsx`

- [ ] **Step 1: Add schedule types and data to npcs.ts**

Add to `src/data/npcs.ts`:

```typescript
export type TimeOfDay = 'morning' | 'afternoon' | 'night'

export interface NPCSchedule {
  period: TimeOfDay
  position: { top: string; left?: string; right?: string; marginLeft?: number; marginRight?: number }
  direction: 'south' | 'north' | 'east' | 'west'
  absent?: boolean
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}
```

Add `schedule: NPCSchedule[]` to each NPC definition with 3 entries per NPC (morning/afternoon/night positions as defined in the spec).

Add helper:

```typescript
export function getNPCPosition(npc: NPC, time: TimeOfDay) {
  const entry = npc.schedule?.find(s => s.period === time)
  if (entry?.absent) return null
  return entry ? { position: entry.position, direction: entry.direction }
    : { position: npc.position, direction: npc.defaultDirection }
}
```

- [ ] **Step 2: Update LibraryRoom to use time-based NPC positions**

Add time state with 1-minute refresh:

```typescript
const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay())

useEffect(() => {
  const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
  return () => clearInterval(interval)
}, [])
```

In each NPC render block, use `getNPCPosition(npc, timeOfDay)` instead of `npc.position`/`npc.defaultDirection`. If `null` (absent), skip rendering.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/data/npcs.ts src/components/LibraryRoom.tsx
git commit -m "feat: NPC 시간대별 이동 — 실시간 24h 기반 3개 시간대"
```

---

## Task 6: CSS 애니메이션 강화

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Enhance candle-flicker with scale**

Update existing `@keyframes candle-flicker`:

```css
@keyframes candle-flicker {
  0% { filter: brightness(1); transform: scale(1); }
  25% { filter: brightness(1.15); transform: scale(1.03); }
  50% { filter: brightness(0.95); transform: scale(0.97); }
  75% { filter: brightness(1.1); transform: scale(1.02); }
  100% { filter: brightness(1.05); transform: scale(1); }
}
```

- [ ] **Step 2: Add NPC sway animation**

```css
.lr-npc-clickable {
  animation: npc-idle 3s ease-in-out infinite, npc-sway 5s ease-in-out infinite;
}

@keyframes npc-sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1deg); }
}
```

- [ ] **Step 3: Enhance speech bubble animation**

Update existing `@keyframes bubble-in`:

```css
@keyframes bubble-in {
  0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
  60% { opacity: 1; transform: translateX(-50%) scale(1.05); }
  100% { transform: translateX(-50%) scale(1); }
}
```

- [ ] **Step 4: Add flash overlay for celebrate effect**

```css
.lr-flash {
  position: absolute;
  inset: 0;
  background: white;
  z-index: 15;
  pointer-events: none;
  animation: flash-out 0.3s ease-out forwards;
}

@keyframes flash-out {
  0% { opacity: 0.4; }
  100% { opacity: 0; }
}
```

- [ ] **Step 5: Add streak pulse**

```css
.streak-pulse {
  animation: streak-pulse 0.5s ease-out;
}

@keyframes streak-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "fix: CSS 애니메이션 강화 — 촛불 scale, NPC sway, 말풍선 바운스, 플래시"
```

---

## Task 7: 시각 효과 통합 (완독/퀘스트/해금/스트릭)

**Files:**
- Modify: `src/components/LibraryRoom.tsx`
- Modify: `src/components/ProgressIndicator.tsx`

- [ ] **Step 1: Add celebrate effect to quest completion**

In LibraryRoom, when `complete_quest` action fires:

```typescript
// After completeQuest(node.action.payload):
play('questComplete')
dustRef.current?.celebrate(window.innerWidth / 2, window.innerHeight / 3)
setShowFlash(true)
setTimeout(() => setShowFlash(false), 300)
```

Add `const [showFlash, setShowFlash] = useState(false)` and render `{showFlash && <div className="lr-flash" />}`.

- [ ] **Step 2: Add streak pulse to ProgressIndicator**

In ProgressIndicator, add `streakPulse` state that triggers when streak changes:

```typescript
const [streakPulse, setStreakPulse] = useState(false)
const prevStreak = useRef(streak)

useEffect(() => {
  if (streak > prevStreak.current) {
    setStreakPulse(true)
    setTimeout(() => setStreakPulse(false), 500)
  }
  prevStreak.current = streak
}, [streak])

// On the streak span:
<span className={`progress-indicator-streak ${streakPulse ? 'streak-pulse' : ''}`}>
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/LibraryRoom.tsx src/components/ProgressIndicator.tsx
git commit -m "feat: 시각 효과 — 퀘스트 완료 축하 + 스트릭 펄스"
```

---

## Task 8: 앰비언트 배경음 생성 (fallback)

**Files:**
- Create: `public/audio/ambient-library.mp3`
- Or modify: `src/audio/synth.ts` (fallback 합성)

- [ ] **Step 1: Generate ambient with Web Audio as fallback**

Add to `src/audio/synth.ts`:

```typescript
export function createAmbientNoise(ctx: AudioContext): AudioBufferSourceNode {
  // Brown noise for ambient library feel
  const bufferSize = ctx.sampleRate * 10 // 10 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + (0.02 * white)) / 1.02
    data[i] = lastOut * 3.5
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const gain = ctx.createGain()
  gain.gain.value = 0.08

  source.connect(gain).connect(ctx.destination)
  return source
}
```

Update SoundContext to use this if MP3 fails to load.

- [ ] **Step 2: Create placeholder MP3**

Create a minimal silent/ambient `public/audio/ambient-library.mp3`. If a real CC0 file isn't available, the synthesized fallback above will be used.

For now, create the directory:

```bash
mkdir -p public/audio
```

- [ ] **Step 3: Commit**

```bash
git add src/audio/synth.ts public/audio/
git commit -m "feat: 앰비언트 배경음 — 브라운 노이즈 합성 fallback"
```

---

## Task 9: 전체 통합 + 빌드 + QA

**Files:**
- All modified files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS (69+ tests)

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Screenshot QA**

1. Home → 먼지 파티클 보이는지
2. NPC 시간대별 위치 변경 (시간 조작 필요하면 getTimeOfDay mock)
3. SoundToggle 아이콘 변경
4. NPC 클릭 → 말풍선 바운스 애니메이션

- [ ] **Step 4: Update worklog**

```bash
git add docs/worklog.md
git commit -m "docs: Phase 3 Animation + Sound 완료"
```

- [ ] **Step 5: Push + Deploy**

```bash
git push origin main
```
