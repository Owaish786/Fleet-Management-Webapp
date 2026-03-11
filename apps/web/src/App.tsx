import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import { Layout } from './components/layout'
import { ProtectedRoute } from './components/protected-route'

const DashboardPage = lazy(() => import('./pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const DriversPage = lazy(() => import('./pages/drivers-page').then((module) => ({ default: module.DriversPage })))
const ForgotPasswordPage = lazy(() => import('./pages/forgot-password-page').then((module) => ({ default: module.ForgotPasswordPage })))
const LoginPage = lazy(() => import('./pages/login-page').then((module) => ({ default: module.LoginPage })))
const MaintenancePage = lazy(() => import('./pages/maintenance-page').then((module) => ({ default: module.MaintenancePage })))
const SignupPage = lazy(() => import('./pages/signup-page').then((module) => ({ default: module.SignupPage })))
const TripsPage = lazy(() => import('./pages/trips-page').then((module) => ({ default: module.TripsPage })))
const VehiclesPage = lazy(() => import('./pages/vehicles-page').then((module) => ({ default: module.VehiclesPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600/25 border-t-brand-600" />
        Loading workspace...
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
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
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
