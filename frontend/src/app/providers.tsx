/** App providers — QueryClientProvider wraps the entire app. */
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClient } from '@entities/api/queryClient'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}