import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type { Activity, Bootstrap, Comment, Status, Task, TaskDetail } from '../types'

export const keys = {
  bootstrap: ['bootstrap'] as const,
  projectTasks: (projectId: string) => ['project', projectId, 'tasks'] as const,
  task: (taskId: string) => ['task', taskId] as const,
  myTasks: (userId: string) => ['myTasks', userId] as const,
  activity: (projectId: string) => ['activity', projectId] as const,
}

/* ------------------------------- queries ------------------------------ */

export function useBootstrap() {
  return useQuery({
    queryKey: keys.bootstrap,
    queryFn: () => api.get<Bootstrap>('/api/bootstrap'),
    staleTime: Infinity,
  })
}

export function useProjectTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: projectId ? keys.projectTasks(projectId) : ['project', 'none', 'tasks'],
    queryFn: () => api.get<Task[]>(`/api/projects/${projectId}/tasks`),
    enabled: !!projectId,
  })
}

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: taskId ? keys.task(taskId) : ['task', 'none'],
    queryFn: () => api.get<TaskDetail>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  })
}

export function useMyTasks(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? keys.myTasks(userId) : ['myTasks', 'none'],
    queryFn: () => api.get<Task[]>(`/api/tasks?assignee=${userId}`),
    enabled: !!userId,
  })
}

export function useProjectActivity(projectId: string | undefined) {
  return useQuery({
    queryKey: projectId ? keys.activity(projectId) : ['activity', 'none'],
    queryFn: () => api.get<Activity[]>(`/api/projects/${projectId}/activity`),
    enabled: !!projectId,
  })
}

/* --------------------- optimistic cache utilities --------------------- */

type TaskListKeyKind = readonly unknown[]

function listMatchers(qc: QueryClient): TaskListKeyKind[] {
  // All cached arrays of tasks (project boards + My Work lists).
  return [['project'], ['myTasks']]
}

function snapshotTasks(qc: QueryClient) {
  return [
    ...qc.getQueriesData<Task[]>({ queryKey: ['project'] }),
    ...qc.getQueriesData<Task[]>({ queryKey: ['myTasks'] }),
    ...qc.getQueriesData<TaskDetail>({ queryKey: ['task'] }),
  ]
}

function restoreTasks(qc: QueryClient, snapshot: ReturnType<typeof snapshotTasks>) {
  for (const [key, data] of snapshot) qc.setQueryData(key, data)
}

/** Apply a transform to a task wherever it lives in the task-list caches. */
function patchTaskLists(qc: QueryClient, taskId: string, fn: (t: Task) => Task) {
  for (const matcher of listMatchers(qc)) {
    qc.setQueriesData<Task[]>({ queryKey: matcher }, (old) =>
      old ? old.map((t) => (t.id === taskId ? fn(t) : t)) : old,
    )
  }
}

function removeTaskFromLists(qc: QueryClient, taskId: string) {
  for (const matcher of listMatchers(qc)) {
    qc.setQueriesData<Task[]>({ queryKey: matcher }, (old) =>
      old ? old.filter((t) => t.id !== taskId) : old,
    )
  }
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

async function settleTasks(qc: QueryClient) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ['project'] }),
    qc.invalidateQueries({ queryKey: ['myTasks'] }),
    qc.invalidateQueries({ queryKey: ['activity'] }),
  ])
}

/* ------------------------------ mutations ----------------------------- */

export interface UpdateTaskVars {
  id: string
  patch: Partial<
    Pick<
      Task,
      | 'title'
      | 'description'
      | 'status'
      | 'position'
      | 'priority'
      | 'assigneeId'
      | 'dueDate'
      | 'labelIds'
    >
  >
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: UpdateTaskVars) => api.patch<Task>(`/api/tasks/${id}`, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries()
      const snapshot = snapshotTasks(qc)
      const clean = stripUndefined(patch)
      patchTaskLists(qc, id, (t) => ({ ...t, ...clean, updatedAt: new Date().toISOString() }))
      qc.setQueryData<TaskDetail>(keys.task(id), (old) =>
        old ? { ...old, ...clean, updatedAt: new Date().toISOString() } : old,
      )
      return { snapshot }
    },
    onError: (_e, _v, ctx) => ctx && restoreTasks(qc, ctx.snapshot),
    onSettled: () => settleTasks(qc),
  })
}

export interface CreateTaskVars {
  projectId: string
  projectKey: string
  input: {
    title: string
    description?: string
    status?: Status
    priority?: Task['priority']
    assigneeId?: string | null
    dueDate?: string | null
    labelIds?: string[]
  }
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, input }: CreateTaskVars) =>
      api.post<Task>(`/api/projects/${projectId}/tasks`, input),
    onMutate: async ({ projectId, projectKey, input }) => {
      await qc.cancelQueries({ queryKey: keys.projectTasks(projectId) })
      const snapshot = snapshotTasks(qc)
      const optimistic: Task = {
        id: `temp_${Math.random().toString(36).slice(2)}`,
        projectId,
        projectKey,
        seq: 0,
        key: `${projectKey}-…`,
        title: input.title,
        description: input.description ?? '',
        status: input.status ?? 'backlog',
        position: Number.MAX_SAFE_INTEGER, // sinks to the bottom of its column
        priority: input.priority ?? 'none',
        assigneeId: input.assigneeId ?? null,
        dueDate: input.dueDate ?? null,
        labelIds: input.labelIds ?? [],
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      qc.setQueryData<Task[]>(keys.projectTasks(projectId), (old) =>
        old ? [...old, optimistic] : old,
      )
      return { snapshot }
    },
    onError: (_e, _v, ctx) => ctx && restoreTasks(qc, ctx.snapshot),
    onSettled: () => settleTasks(qc),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/tasks/${id}`),
    onMutate: async (id: string) => {
      await qc.cancelQueries()
      const snapshot = snapshotTasks(qc)
      removeTaskFromLists(qc, id)
      return { snapshot }
    },
    onError: (_e, _v, ctx) => ctx && restoreTasks(qc, ctx.snapshot),
    onSettled: () => settleTasks(qc),
  })
}

export interface AddCommentVars {
  taskId: string
  body: string
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    // The server attributes the comment to the authenticated user.
    mutationFn: ({ taskId, body }: AddCommentVars) =>
      api.post<Comment>(`/api/tasks/${taskId}/comments`, { body }),
    onSuccess: (comment, { taskId }) => {
      qc.setQueryData<TaskDetail>(keys.task(taskId), (old) =>
        old ? { ...old, comments: [...old.comments, comment], commentCount: old.commentCount + 1 } : old,
      )
      patchTaskLists(qc, taskId, (t) => ({ ...t, commentCount: t.commentCount + 1 }))
      qc.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}
