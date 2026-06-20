import { Router } from 'express'
import {
  createTask,
  getProject,
  listActivity,
  listProjects,
  listTasksByProject,
} from '../repo'

const router = Router()

router.get('/', (_req, res) => res.json(listProjects()))

router.get('/:id', (req, res) => {
  const project = getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json({ project, tasks: listTasksByProject(project.id) })
})

router.get('/:id/tasks', (req, res) => {
  if (!getProject(req.params.id)) return res.status(404).json({ error: 'Project not found' })
  res.json(listTasksByProject(req.params.id))
})

router.get('/:id/activity', (req, res) => {
  if (!getProject(req.params.id)) return res.status(404).json({ error: 'Project not found' })
  res.json(listActivity(req.params.id))
})

router.post('/:id/tasks', (req, res, next) => {
  try {
    const task = createTask(req.params.id, req.body ?? {}, req.user!.id)
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
})

export default router
