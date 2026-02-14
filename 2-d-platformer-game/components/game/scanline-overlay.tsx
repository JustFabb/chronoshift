'use client'

export function ScanlineOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {/* Static horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.15) 2px, rgba(0, 255, 136, 0.15) 4px)',
        }}
      />
      {/* Moving scanline */}
      <div
        className="absolute left-0 h-[4px] w-full animate-scanline opacity-20"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgba(0, 255, 136, 0.3), transparent)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  )
}
