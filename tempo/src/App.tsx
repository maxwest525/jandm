import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BoardView } from './views/BoardView'
import { MyWorkView } from './views/MyWorkView'
import { NotFoundView } from './views/NotFoundView'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/my-work" replace />} />
        <Route path="/my-work" element={<MyWorkView />} />
        <Route path="/projects/:projectId" element={<BoardView />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  )
}
