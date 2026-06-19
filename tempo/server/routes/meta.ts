import { Router } from 'express'
import { listLabels, listProjects, listUsers } from '../repo'

const router = Router()

function currentUserId(): string {
  const users = listUsers()
  const me = users.find((u) => u.email === 'maya@tempo.dev') ?? users[0]
  return me?.id ?? ''
}

// Everything the client needs to boot: who am I, the team, projects, labels.
router.get('/bootstrap', (_req, res) => {
  res.json({
    currentUserId: currentUserId(),
    users: listUsers(),
    projects: listProjects(),
    labels: listLabels(),
  })
})

router.get('/users', (_req, res) => res.json(listUsers()))
router.get('/labels', (_req, res) => res.json(listLabels()))

export default router
