import express, { type NextFunction, type Request, type Response, Router } from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initSchema } from './db'
import { seedIfEmpty } from './seed'
import { HttpError } from './repo'
import { attachUser, ensureCredentials, requireAuth, writeGuard } from './auth'
import authRoutes from './routes/auth'
import meta from './routes/meta'
import projects from './routes/projects'
import tasks from './routes/tasks'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 4000)

initSchema()
seedIfEmpty()
ensureCredentials()

const app = express()
app.use(express.json())

app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    process.stdout.write(`\x1b[2m${req.method} ${req.path}\x1b[0m\n`)
  }
  next()
})

// Resolve the session user for every request (if any).
app.use(attachUser)

// Public endpoints.
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)

// Authenticated API. Viewers are blocked from mutating requests.
const api = Router()
api.use(requireAuth)
api.use(writeGuard)
api.use('/projects', projects)
api.use('/tasks', tasks)
api.use(meta)
app.use('/api', api)

// Serve the built client in production (`npm run build` then `npm start`).
if (process.env.NODE_ENV === 'production') {
  const dist = join(__dirname, '..', 'dist')
  if (existsSync(dist)) {
    app.use(express.static(dist))
    app.get('*', (_req, res) => res.sendFile(join(dist, 'index.html')))
  }
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\x1b[35m✓ Tempo API on http://localhost:${PORT}\x1b[0m`)
})
