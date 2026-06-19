import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface CommandBarState {
  open: boolean
  setOpen: (open: boolean) => void
}

const Ctx = createContext<CommandBarState | null>(null)

export function CommandBarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo(() => ({ open, setOpen }), [open])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommandBar() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCommandBar must be used within CommandBarProvider')
  return ctx
}
