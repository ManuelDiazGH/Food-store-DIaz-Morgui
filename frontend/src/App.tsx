import { RouterProvider } from 'react-router-dom'
import { router } from '@app/router'
import { AppProviders } from '@app/providers'
import { ErrorBoundary } from '@app/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App