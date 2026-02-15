'use client'

import { useState, useEffect, useRef } from 'react' //
import { AnimatePresence, motion } from 'framer-motion'
import { LEVELS, type LevelData } from './constants'
import { TitleScreen } from './title-screen'
import { LevelSelect } from './level-select'
import { GameSession } from './game-session'
import { LevelEditor } from './level-editor'
import { saveCustomLevel } from '@/lib/supabase'

type Screen = 'title' | 'levels' | 'game' | 'editor'

export function PlatformerGame() {
  const [screen, setScreen] = useState<Screen>('title')
  const [levelIndex, setLevelIndex] = useState(0)
  const [customLevel, setCustomLevel] = useState<LevelData | null>(null)
  const [isPlayingCustom, setIsPlayingCustom] = useState(false)

  // 1. Create a reference to hold the audio object
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 2. Initialize the audio settings when the component first loads
  useEffect(() => {
    if (!audioRef.current) {
      // Ensure your file is in the 'public' folder and named exactly 'bg-music.mp3'
      audioRef.current = new Audio('/bg-music.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.3 // Set a comfortable background volume
    }
  }, [])

  // 3. Create a function to start music on the first user interaction
  const startMusicAndProceed = () => {
    audioRef.current?.play().catch((err) => {
      console.warn("Audio play blocked or failed:", err)
    })
    setScreen('levels')
  }

  const handleSaveCustomLevel = async (level: LevelData) => {
    try {
      await saveCustomLevel({
        name: level.name,
        subtitle: level.subtitle,
        platforms: level.platforms,
        walls: level.walls,
        playerStart: level.playerStart,
        playerStart2: level.playerStart2,
        flag: level.flag,
      })
      setCustomLevel(level)
      setIsPlayingCustom(true)
      setScreen('game')
    } catch (error) {
      console.error('Failed to save level:', error)
    }
  }

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
            {/* 4. Use the new function here to unlock audio */}
            <TitleScreen onStart={startMusicAndProceed} />
          </motion.div>
        )}

        {/* ... rest of your components remain the same ... */}
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
                setIsPlayingCustom(false)
                setScreen('game')
              }}
              onBack={() => setScreen('title')}
              onEditLevel={() => setScreen('editor')}
              onSelectCustomLevel={(level) => {
                setCustomLevel(level)
                setIsPlayingCustom(true)
                setScreen('game')
              }}
            />
          </motion.div>
        )}

        {screen === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LevelEditor
              onSave={handleSaveCustomLevel}
              onBack={() => setScreen('levels')}
            />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key={`game-${isPlayingCustom ? 'custom' : levelIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameSession
              level={isPlayingCustom && customLevel ? customLevel : LEVELS[levelIndex]}
              levelIndex={isPlayingCustom ? -1 : levelIndex}
              onBack={() => setScreen('levels')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
