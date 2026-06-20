import { Router } from 'express'
import {
  addComment,
  deleteTask,
  getTaskDetail,
  listTasksByAssignee,
  updateTask,
} from '../repo'

const router = Router()

// My Work / cross-project queries: /api/tasks?assignee=<userId>
router.get('/', (req, res) => {
  const assignee = req.query.assignee
  if (typeof assignee === 'string' && assignee) {
    return res.json(listTasksByAssignee(assignee))
  }
  res.status(400).json({ error: 'Provide an ?assignee=<userId> filter' })
})

router.get('/:id', (req, res) => {
  const task = getTaskDetail(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

router.patch('/:id', (req, res, next) => {
  try {
    res.json(updateTask(req.params.id, req.body ?? {}, req.user!.id))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', (req, res, next) => {
  try {
    deleteTask(req.params.id, req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:id/comments', (req, res, next) => {
  try {
    // Comment author is always the authenticated user.
    res.status(201).json(addComment(req.params.id, req.user!.id, req.body?.body ?? ''))
  } catch (err) {
    next(err)
  }
})

export default router
