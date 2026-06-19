import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Drives the task detail panel via the `?task=<id>` search param so it can
 *  overlay any view and is deep-linkable / back-button friendly. */
export function useTaskPanel() {
  const [params, setParams] = useSearchParams()
  const taskId = params.get('task')

  const openTask = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params)
      next.set('task', id)
      setParams(next)
    },
    [params, setParams],
  )

  const closeTask = useCallback(() => {
    const next = new URLSearchParams(params)
    next.delete('task')
    setParams(next)
  }, [params, setParams])

  return { taskId, openTask, closeTask }
}
