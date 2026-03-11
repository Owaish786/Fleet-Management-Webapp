import { Navigate } from 'react-router-dom'
import { LoadingScreen } from './loading-screen'
import { useAuth } from '../context/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Checking secure access and restoring your operator session..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
