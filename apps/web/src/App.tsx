import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import { Layout } from './components/layout'
import { LoadingScreen } from './components/loading-screen'
import { ProtectedRoute } from './components/protected-route'
import { LandingPage } from './pages/landing-page'

const DashboardPage = lazy(() => import('./pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const DriversPage = lazy(() => import('./pages/drivers-page').then((module) => ({ default: module.DriversPage })))
const ForgotPasswordPage = lazy(() => import('./pages/forgot-password-page').then((module) => ({ default: module.ForgotPasswordPage })))
const LoginPage = lazy(() => import('./pages/login-page').then((module) => ({ default: module.LoginPage })))
const MaintenancePage = lazy(() => import('./pages/maintenance-page').then((module) => ({ default: module.MaintenancePage })))
const SignupPage = lazy(() => import('./pages/signup-page').then((module) => ({ default: module.SignupPage })))
const TrackingPage = lazy(() => import('./pages/tracking-page').then((module) => ({ default: module.TrackingPage })))
const TripsPage = lazy(() => import('./pages/trips-page').then((module) => ({ default: module.TripsPage })))
const VehiclesPage = lazy(() => import('./pages/vehicles-page').then((module) => ({ default: module.VehiclesPage })))

function RouteFallback() {
  return <LoadingScreen message="Loading the next route, dashboard, and fleet controls..." />
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
