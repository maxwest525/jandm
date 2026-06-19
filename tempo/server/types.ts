export type Status = 'backlog' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type Role = 'owner' | 'member' | 'viewer'

export const STATUSES: Status[] = ['backlog', 'in_progress', 'in_review', 'done']
export const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none']

export interface User {
  id: string
  name: string
  email: string
  initials: string
  color: string
  role: Role
}

export type ActivityType =
  | 'task_created'
  | 'task_moved'
  | 'task_updated'
  | 'commented'
  | 'task_deleted'

export interface Activity {
  id: string
  projectId: string
  taskId: string | null
  type: ActivityType
  actor: User
  data: Record<string, unknown>
  createdAt: string
}

export interface Project {
  id: string
  key: string
  name: string
  description: string
  color: string
  createdAt: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  projectId: string
  projectKey: string
  seq: number
  key: string // e.g. "TEM-12"
  title: string
  description: string
  status: Status
  position: number
  priority: Priority
  assigneeId: string | null
  dueDate: string | null
  labelIds: string[]
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  taskId: string
  author: User
  body: string
  createdAt: string
}

export interface TaskDetail extends Task {
  comments: Comment[]
}
