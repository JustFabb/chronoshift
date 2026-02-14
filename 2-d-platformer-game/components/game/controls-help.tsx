'use client'

export function ControlsHelp() {
  const keys = [
    { label: 'MOVE', keys: ['A', 'D'] },
    { label: 'JUMP', keys: ['W', 'SPACE'] },
    { label: 'TELEPORT', keys: ['SHIFT + DIR'] },
    { label: 'RESTART', keys: ['R'] },
  ]

  return (
    <div className="flex items-center justify-center gap-6 py-3">
      {keys.map((group) => (
        <div key={group.label} className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">{group.label}</span>
          <div className="flex gap-1">
            {group.keys.map((k) => (
              <kbd
                key={k}
                className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground"
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
