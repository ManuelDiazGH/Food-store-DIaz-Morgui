import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@shared/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">&#x26A0;&#xFE0F;</div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              Algo salió mal
            </h1>
            <p className="text-stone-600 mb-6">
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
            {this.state.error && (
              <p className="text-sm text-stone-400 mb-6 font-mono bg-stone-100 rounded p-2">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleRetry} size="lg">
              Reintentar
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}