import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MealLog from './pages/MealLog'
import MealPlans from './pages/MealPlans'
import Progress from './pages/Progress'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import { useAuthStore } from './store/auth'

function PrivateRoute({ children }: { children: ReactElement }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="log" element={<MealLog />} />
        <Route path="plans" element={<MealPlans />} />
        <Route path="progress" element={<Progress />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
