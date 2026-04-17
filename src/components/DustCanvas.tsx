import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; alpha: number
}

interface CelebrateParticle {
  x: number; y: number
  vx: number; vy: number
  alpha: number
  life: number; maxLife: number
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
  const rafRef = useRef(0)

  const celebrate = useCallback((x: number, y: number) => {
    const colors = ['#f5c542', '#ff6b35', '#fff', '#d4a017', '#87CEEB']
    for (let i = 0; i < 5; i++) {
      celebrateRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
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
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.3 + 0.08,
    }))

    const loop = () => {
      if (document.hidden) { rafRef.current = requestAnimationFrame(loop); return }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dust
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
        p.vy += 0.12
        p.life++
        p.alpha = 1 - p.life / p.maxLife

        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        // Pixel star: cross shape
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
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}
    />
  )
})
