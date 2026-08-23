import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { AppShell } from '@/layouts/AppShell'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const BoardPage = lazy(() => import('@/pages/BoardPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<FullScreenLoader />}>{element}</Suspense>
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: withSuspense(<LoginPage />) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: withSuspense(<DashboardPage />) },
          { path: '/board', element: withSuspense(<BoardPage />) },
          { path: '/analytics', element: withSuspense(<AnalyticsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
