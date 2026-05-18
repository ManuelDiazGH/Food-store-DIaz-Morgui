type SpinnerSize = 'sm' | 'md' | 'lg'
type SpinnerColor = 'green' | 'white' | 'stone'

interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

const colorMap: Record<SpinnerColor, string> = {
  green: 'border-brand-600',
  white: 'border-white',
  stone: 'border-stone-400',
}

export function Spinner({ size = 'md', color = 'green', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`
        inline-block animate-spin rounded-full
        border-2 border-t-transparent
        ${sizeMap[size]}
        ${colorMap[color]}
        ${className}
      `.trim()}
    />
  )
}
