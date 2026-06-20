import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useBootstrap } from '../api/queries'
import { ApiError } from '../api/client'
import type { Label, Project, User } from '../types'
import { FullScreenLoader } from '../components/states/FullScreenLoader'
import { FullScreenError } from '../components/states/FullScreenError'
import { LoginView } from '../components/auth/LoginView'

interface AppDataState {
  currentUser: User
  canEdit: boolean
  users: User[]
  projects: Project[]
  labels: Label[]
  userById: (id: string | null) => User | undefined
  labelById: (id: string) => Label | undefined
  projectById: (id: string) => Project | undefined
}

const Ctx = createContext<AppDataState | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useBootstrap()

  const value = useMemo<AppDataState | null>(() => {
    if (!data) return null
    const userMap = new Map(data.users.map((u) => [u.id, u]))
    const labelMap = new Map(data.labels.map((l) => [l.id, l]))
    const projectMap = new Map(data.projects.map((p) => [p.id, p]))
    const currentUser = userMap.get(data.currentUserId) ?? data.users[0]
    return {
      currentUser,
      canEdit: currentUser.role !== 'viewer',
      users: data.users,
      projects: data.projects,
      labels: data.labels,
      userById: (id) => (id ? userMap.get(id) : undefined),
      labelById: (id) => labelMap.get(id),
      projectById: (id) => projectMap.get(id),
    }
  }, [data])

  if (isLoading) return <FullScreenLoader />
  if (isError) {
    // Not logged in → show the login screen instead of an error.
    if (error instanceof ApiError && error.status === 401) return <LoginView />
    return (
      <FullScreenError
        message={(error as Error)?.message ?? 'Could not reach the Tempo server.'}
        onRetry={() => refetch()}
      />
    )
  }
  if (!value) return <FullScreenLoader />

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppDataProvider')
  return ctx
}
