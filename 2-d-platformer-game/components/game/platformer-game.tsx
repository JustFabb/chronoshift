'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LEVELS } from './constants'
import { TitleScreen } from './title-screen'
import { LevelSelect } from './level-select'
import { GameSession } from './game-session'

type Screen = 'title' | 'levels' | 'game'

export function PlatformerGame() {
  const [screen, setScreen] = useState<Screen>('title')
  const [levelIndex, setLevelIndex] = useState(0)

  return (
    <div className="flex flex-col items-center gap-0">
      <AnimatePresence mode="wait">
        {screen === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TitleScreen onStart={() => setScreen('levels')} />
          </motion.div>
        )}

        {screen === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LevelSelect
              onSelect={(idx) => {
                setLevelIndex(idx)
                setScreen('game')
              }}
              onBack={() => setScreen('title')}
            />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key={`game-${levelIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameSession
              level={LEVELS[levelIndex]}
              levelIndex={levelIndex}
              onBack={() => setScreen('levels')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
