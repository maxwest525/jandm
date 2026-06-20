import { Router } from 'express'
import { listLabels, listProjects, listUsers } from '../repo'

const router = Router()

// Everything the client needs to boot: who am I, the team, projects, labels.
// `requireAuth` upstream guarantees req.user exists.
router.get('/bootstrap', (req, res) => {
  res.json({
    currentUserId: req.user!.id,
    users: listUsers(),
    projects: listProjects(),
    labels: listLabels(),
  })
})

router.get('/users', (_req, res) => res.json(listUsers()))
router.get('/labels', (_req, res) => res.json(listLabels()))

export default router
