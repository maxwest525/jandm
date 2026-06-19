import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { User } from '../types'

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      api.post<User>('/api/auth/login', vars),
    onSuccess: () => {
      // Re-run bootstrap (and anything else) now that we're authenticated.
      qc.invalidateQueries()
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => {
      // Drop all cached data; bootstrap will refetch and 401 → login screen.
      qc.clear()
      qc.invalidateQueries()
    },
  })
}
