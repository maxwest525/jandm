import crypto from 'node:crypto'
import { nanoid } from 'nanoid'
import type { NextFunction, Request, Response } from 'express'
import { db } from './db'
import type { Role, User } from './types'

/* ----------------------------- passwords ------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
}

/* ---------------------- seed credentials & roles ---------------------- */

export const DEMO_PASSWORD = 'tempo'

// One of each role for the demo; everyone else is a Member.
const ROLE_BY_EMAIL: Record<string, Role> = {
  'maya@tempo.dev': 'owner',
  'sam@tempo.dev': 'member',
  'priya@tempo.dev': 'viewer',
}

/** Give any user missing credentials a role + the demo password. Safe to run
 *  on every boot — it only touches rows that haven't been set up yet. */
export function ensureCredentials(): void {
  const rows = db.prepare("SELECT id, email FROM users WHERE password_hash = ''").all() as {
    id: string
    email: string
  }[]
  const setRole = db.prepare('UPDATE users SET role = ?, password_hash = ? WHERE id = ?')
  for (const r of rows) {
    const role = ROLE_BY_EMAIL[r.email] ?? 'member'
    setRole.run(role, hashPassword(DEMO_PASSWORD), r.id)
  }
}

/* ------------------------------ sessions ------------------------------ */

const COOKIE = 'tempo_session'

export function createSession(userId: string): string {
  const token = nanoid(32)
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    new Date().toISOString(),
  )
  return token
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

function userForToken(token: string): User | undefined {
  return db
    .prepare(
      `SELECT u.id, u.name, u.email, u.initials, u.color, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
    )
    .get(token) as User | undefined
}

/* ------------------------------- cookies ------------------------------ */

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim())
  }
  return out
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
  )
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`)
}

export function readSessionToken(req: Request): string | undefined {
  return parseCookies(req.headers.cookie)[COOKIE]
}

/* ----------------------------- middleware ----------------------------- */

// Augment Express's Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const token = readSessionToken(req)
  if (token) req.user = userForToken(token)
  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  next()
}

/** Block writes (POST/PATCH/PUT/DELETE) for Viewers. */
export function writeGuard(req: Request, res: Response, next: NextFunction): void {
  const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)
  if (mutating && req.user?.role === 'viewer') {
    res.status(403).json({ error: 'Viewers have read-only access' })
    return
  }
  next()
}
