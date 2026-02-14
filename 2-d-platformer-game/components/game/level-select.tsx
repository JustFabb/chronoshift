'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LEVELS,
  NEON_PURPLE,
  NEON_GREEN,
  NEON_BLUE,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
} from './constants'
import { ScanlineOverlay } from './scanline-overlay'

interface LevelSelectProps {
  onSelect: (levelIndex: number) => void
  onBack: () => void
}

const levelColors = [NEON_GREEN, NEON_BLUE, NEON_PURPLE]
const levelDifficulty = ['EASY', 'MEDIUM', 'HARD']

function MiniMap({ levelIndex }: { levelIndex: number }) {
  const level = LEVELS[levelIndex]
  const scale = 0.16
  const color = levelColors[levelIndex]

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: GAME_WIDTH * scale,
        height: GAME_HEIGHT * scale,
        background: '#08060e',
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.15,
        }}
      />
      {level.platforms.map((p, i) => (
        <div
          key={`p-${i}`}
          className="absolute"
          style={{
            left: p.x * scale,
            top: p.y * scale,
            width: p.w * scale,
            height: Math.max(p.h * scale, 1),
            background: `${color}55`,
          }}
        />
      ))}
      {level.walls.map((w, i) => (
        <div
          key={`w-${i}`}
          className="absolute"
          style={{
            left: w.x * scale,
            top: w.y * scale,
            width: Math.max(w.w * scale, 1),
            height: w.h * scale,
            background: w.isThin ? `${NEON_BLUE}44` : `${color}22`,
          }}
        />
      ))}
      <div
        className="absolute"
        style={{
          left: level.playerStart.x * scale,
          top: level.playerStart.y * scale,
          width: Math.max(PLAYER_SIZE * scale, 2),
          height: Math.max(PLAYER_SIZE * scale, 2),
          background: NEON_GREEN,
          boxShadow: `0 0 3px ${NEON_GREEN}88`,
        }}
      />
      {level.flag && (
        <div
          className="absolute"
          style={{
            left: level.flag.x * scale,
            top: level.flag.y * scale,
            width: 3,
            height: 5,
            background: NEON_GREEN,
            boxShadow: `0 0 4px ${NEON_GREEN}66`,
          }}
        />
      )}
    </div>
  )
}

export function LevelSelect({ onSelect, onBack }: LevelSelectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden border border-border"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: '#08060e',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.15,
          filter: 'brightness(0.6)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${NEON_PURPLE}44 1px, transparent 1px), linear-gradient(90deg, ${NEON_PURPLE}44 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-2 flex items-center gap-3"
      >
        <div className="h-px w-12" style={{ background: `linear-gradient(90deg, transparent, ${NEON_PURPLE}66)` }} />
        <h2 className="font-mono text-sm font-bold tracking-[0.3em] text-muted-foreground">SELECT LEVEL</h2>
        <div className="h-px w-12" style={{ background: `linear-gradient(90deg, ${NEON_PURPLE}66, transparent)` }} />
      </motion.div>

      <div className="z-10 flex items-stretch gap-5 px-8 py-6">
        {LEVELS.map((level, index) => {
          const color = levelColors[index]
          const isHovered = hoveredIndex === index

          return (
            <motion.button
              key={level.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(index)}
              className="group relative flex cursor-pointer flex-col items-center border bg-transparent px-5 pb-4 pt-3 transition-all duration-300"
              style={{
                width: 200,
                borderColor: isHovered ? `${color}88` : `${color}33`,
                boxShadow: isHovered ? `0 0 24px ${color}33, inset 0 0 16px ${color}11` : `0 0 8px ${color}11`,
                background: isHovered ? `linear-gradient(180deg, ${color}08 0%, transparent 100%)` : 'transparent',
              }}
            >
              <span className="mb-1 font-mono text-[10px] tracking-widest" style={{ color: `${color}88` }}>
                {'LEVEL '}{String(index + 1).padStart(2, '0')}
              </span>
              <div className="mb-3"><MiniMap levelIndex={index} /></div>
              <span
                className="mb-1 font-mono text-xs font-bold tracking-wider"
                style={{ color, textShadow: isHovered ? `0 0 12px ${color}66` : 'none' }}
              >
                {level.name}
              </span>
              <span className="mb-2 font-mono text-[10px] text-muted-foreground">{level.subtitle}</span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className="h-1.5 w-1.5"
                    style={{
                      background: dot <= index ? color : `${color}22`,
                      boxShadow: dot <= index ? `0 0 4px ${color}66` : 'none',
                    }}
                  />
                ))}
                <span className="ml-1 font-mono text-[9px] tracking-wider" style={{ color: `${color}88` }}>
                  {levelDifficulty[index]}
                </span>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-[2px]"
                initial={{ width: '0%' }}
                animate={{ width: isHovered ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
                style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
              />
            </motion.button>
          )
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
        onClick={onBack}
        className="z-10 mt-2 cursor-pointer font-mono text-xs tracking-wider text-muted-foreground transition-all hover:text-foreground hover:opacity-100"
      >
        {'< BACK'}
      </motion.button>

      <ScanlineOverlay />
    </div>
  )
}
