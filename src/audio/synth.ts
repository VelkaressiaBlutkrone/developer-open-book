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

// C5=523, E5=659, G5=784, A5=880, C6=1047, G4=392

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

/** Brown noise ambient — fallback when MP3 unavailable */
export function createAmbientNoise(ctx: AudioContext): { source: AudioBufferSourceNode; gain: GainNode } {
  const bufferSize = ctx.sampleRate * 10
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
  return { source, gain }
}
