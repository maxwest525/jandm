import { Router } from 'express'
import { db } from '../db'
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  readSessionToken,
  setSessionCookie,
  verifyPassword,
} from '../auth'

const router = Router()

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const row = db
    .prepare(
      'SELECT id, name, email, initials, color, role, password_hash FROM users WHERE lower(email) = lower(?)',
    )
    .get(String(email)) as any
  if (!row || !verifyPassword(String(password), row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = createSession(row.id)
  setSessionCookie(res, token)
  const { password_hash, ...user } = row
  res.json(user)
})

router.post('/logout', (req, res) => {
  const token = readSessionToken(req)
  if (token) deleteSession(token)
  clearSessionCookie(res)
  res.status(204).end()
})

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  res.json(req.user)
})

export default router
