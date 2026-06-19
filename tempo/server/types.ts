export type Status = 'backlog' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export const STATUSES: Status[] = ['backlog', 'in_progress', 'in_review', 'done']
export const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none']

export interface User {
  id: string
  name: string
  email: string
  initials: string
  color: string
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
