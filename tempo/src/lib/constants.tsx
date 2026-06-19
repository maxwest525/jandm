import {
  CircleDashed,
  Circle,
  CircleDot,
  CircleCheck,
  SignalHigh,
  SignalMedium,
  SignalLow,
  AlertTriangle,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import type { Priority, Status } from '../types'

export interface StatusMeta {
  id: Status
  label: string
  color: string
  icon: LucideIcon
}

export const STATUS_ORDER: Status[] = ['backlog', 'in_progress', 'in_review', 'done']

export const STATUS_META: Record<Status, StatusMeta> = {
  backlog: { id: 'backlog', label: 'Backlog', color: '#9499a8', icon: CircleDashed },
  in_progress: { id: 'in_progress', label: 'In Progress', color: '#f2a93b', icon: Circle },
  in_review: { id: 'in_review', label: 'In Review', color: '#7c74ff', icon: CircleDot },
  done: { id: 'done', label: 'Done', color: '#43b581', icon: CircleCheck },
}

export interface PriorityMeta {
  id: Priority
  label: string
  color: string
  icon: LucideIcon
  rank: number
}

export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low', 'none']

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  urgent: { id: 'urgent', label: 'Urgent', color: '#ef4444', icon: AlertTriangle, rank: 0 },
  high: { id: 'high', label: 'High', color: '#f59e0b', icon: SignalHigh, rank: 1 },
  medium: { id: 'medium', label: 'Medium', color: '#eab308', icon: SignalMedium, rank: 2 },
  low: { id: 'low', label: 'Low', color: '#60a5fa', icon: SignalLow, rank: 3 },
  none: { id: 'none', label: 'No priority', color: '#71717a', icon: Minus, rank: 4 },
}
