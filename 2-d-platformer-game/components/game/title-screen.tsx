'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NEON_PURPLE, NEON_GREEN, NEON_BLUE, GAME_WIDTH, GAME_HEIGHT } from './constants'
import { ScanlineOverlay } from './scanline-overlay'

interface Pixel {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  friction: number
}

interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [phase, setPhase] = useState<'idle' | 'exploding' | 'fading'>('idle')
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [showContent, setShowContent] = useState(false)
  const [buttonHidden, setButtonHidden] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pixelsRef = useRef<Pixel[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Rasterize the actual button into pixel data using a hidden canvas
  const rasterizeButton = useCallback(() => {
    const btn = buttonRef.current
    const container = containerRef.current
    if (!btn || !container) return null

    const rect = btn.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Relative position within container
    const bx = rect.left - containerRect.left
    const by = rect.top - containerRect.top
    const bw = rect.width
    const bh = rect.height

    // Sample colors from the button area
    // Since we can't screenshot, we'll use the button's known styling
    // The button has purple border, purple text "> START <" on dark bg
    const pixelSize = 5
    const generated: Pixel[] = []
    let id = 0

    const btnCenterX = bx + bw / 2
    const btnCenterY = by + bh / 2

    // Create pixel grid from the button dimensions
    // Approximate text region: center 60% of button
    const textStartX = bw * 0.15
    const textEndX = bw * 0.85
    const textStartY = bh * 0.2
    const textEndY = bh * 0.8

    for (let px = 0; px < bw; px += pixelSize) {
      for (let py = 0; py < bh; py += pixelSize) {
        const inTextRegion = px >= textStartX && px <= textEndX && py >= textStartY && py <= textEndY

        // Determine the color of this pixel
        let color: string
        const isEdge = px < pixelSize || px > bw - pixelSize * 2 || py < pixelSize || py > bh - pixelSize * 2

        if (isEdge) {
          color = NEON_PURPLE // border color
        } else if (inTextRegion) {
          // Alternate between text color and background
          const charIndex = Math.floor((px - textStartX) / (pixelSize * 2))
          color = charIndex % 3 === 0 ? NEON_PURPLE : charIndex % 3 === 1 ? '#2a1540' : NEON_PURPLE
        } else {
          // Background of button
          color = `rgba(40, 15, 60, 0.9)`
        }

        const cx = bx + px + pixelSize / 2
        const cy = by + py + pixelSize / 2

        // Direction away from center with varying speed
        const dx = cx - btnCenterX
        const dy = cy - btnCenterY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const edgeBoost = isEdge ? 1.5 : 1
        const speed = (1.5 + Math.random() * 3.5) * edgeBoost

        generated.push({
          id: id++,
          x: cx,
          y: cy,
          vx: (dx / dist) * speed + (Math.random() - 0.5) * 2,
          vy: (dy / dist) * speed - Math.random() * 1.5,
          size: pixelSize - 1,
          color,
          opacity: 1,
          friction: 0.96 + Math.random() * 0.02,
        })
      }
    }

    return generated
  }, [])

  const animatePixels = useCallback(() => {
    const updated = pixelsRef.current.map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.04,
      vx: p.vx * p.friction,
      vy2: p.vy * p.friction,
      opacity: p.opacity - 0.006,
    }))

    // Also apply friction to vy
    for (const p of updated) {
      p.vy *= p.friction
    }

    pixelsRef.current = updated
    setPixels([...updated])

    const anyVisible = updated.some((p) => p.opacity > 0.05)

    if (anyVisible) {
      // Check if most are slowed down - transition to fading
      const avgSpeed = updated.reduce((s, p) => s + Math.abs(p.vx) + Math.abs(p.vy), 0) / updated.length
      if (avgSpeed < 0.3 && phase !== 'fading') {
        setPhase('fading')
      }
      rafRef.current = requestAnimationFrame(animatePixels)
    } else {
      onStart()
    }
  }, [onStart, phase])

  const handleStart = useCallback(() => {
    if (phase !== 'idle') return

    const generated = rasterizeButton()
    if (!generated || generated.length === 0) {
      onStart()
      return
    }

    setButtonHidden(true)
    setPhase('exploding')

    pixelsRef.current = generated
    setPixels(generated)

    // Small delay so the button disappears first
    requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(animatePixels)
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, rasterizeButton, animatePixels, onStart])

  return (
    <div
      ref={containerRef}
      data-title-container
      className="relative flex flex-col items-center justify-center overflow-hidden border border-border"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: '#08060e',
      }}
    >
      {/* Ruins bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.2,
          filter: 'brightness(0.6) contrast(1.1)',
        }}
      />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(${NEON_PURPLE}44 1px, transparent 1px),
            linear-gradient(90deg, ${NEON_PURPLE}44 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 400,
          height: 400,
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: `radial-gradient(circle, ${NEON_PURPLE}12 0%, transparent 70%)`,
        }}
      />

      {/* Hidden canvas for rasterization */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {showContent && phase === 'idle' && (
          <>
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4 font-mono text-xs tracking-[0.4em] text-muted-foreground"
            >
              TEMPORAL PLATFORMER
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2 text-balance text-center font-mono text-5xl font-bold tracking-wider text-foreground"
              style={{
                textShadow: `0 0 40px ${NEON_PURPLE}88, 0 0 80px ${NEON_PURPLE}44, 0 0 120px ${NEON_PURPLE}22`,
              }}
            >
              <span style={{ color: NEON_PURPLE }}>CHRONO</span>
              <span style={{ color: NEON_GREEN }}>SHIFT</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-12 font-mono text-sm text-muted-foreground"
            >
              {'Outrun your past. Escape your shadow.'}
            </motion.p>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-8 font-mono text-[10px] text-muted-foreground"
            >
              PRESS START TO INITIALIZE TEMPORAL MATRIX
            </motion.p>
          </>
        )}
      </AnimatePresence>

      {/* Start button - always rendered for measurement, visually hidden when exploded */}
      {showContent && (
        <motion.button
          ref={buttonRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: buttonHidden ? 0 : 1, y: 0 }}
          transition={{ delay: buttonHidden ? 0 : 0.8, duration: buttonHidden ? 0.05 : 0.5 }}
          onClick={handleStart}
          className="relative z-10 cursor-pointer overflow-hidden border-2 bg-transparent px-12 py-4 font-mono text-lg font-bold tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            borderColor: NEON_PURPLE,
            color: NEON_PURPLE,
            boxShadow: buttonHidden ? 'none' : `0 0 20px ${NEON_PURPLE}44, inset 0 0 20px ${NEON_PURPLE}11`,
            pointerEvents: buttonHidden ? 'none' : 'auto',
            visibility: buttonHidden ? 'hidden' : 'visible',
          }}
        >
          {'> START <'}
        </motion.button>
      )}

      {/* Explosion pixels - render on top of everything */}
      {pixels.map(
        (p) =>
          p.opacity > 0.05 && (
            <div
              key={p.id}
              className="pointer-events-none absolute z-20"
              style={{
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                width: p.size,
                height: p.size,
                background: p.color,
                opacity: Math.max(0, p.opacity),
                boxShadow: p.opacity > 0.5 ? `0 0 ${3 + p.size}px ${p.color}88` : 'none',
              }}
            />
          )
      )}

      {/* Fade-to-black overlay during fading phase */}
      <AnimatePresence>
        {phase === 'fading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 z-10 bg-background"
          />
        )}
      </AnimatePresence>

      <ScanlineOverlay />
    </div>
  )
}
