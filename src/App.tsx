import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/app/router'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { restoreSession } from '@/services/auth/sessionService'

export default function App() {
  useApplyTheme()

  useEffect(() => {
    restoreSession()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}
