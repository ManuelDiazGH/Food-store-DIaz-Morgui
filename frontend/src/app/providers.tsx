import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClient } from '@entities/api/queryClient'
import { ToastProvider, ApiErrorListener } from '@shared/ui/Toast'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ApiErrorListener />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  )
}