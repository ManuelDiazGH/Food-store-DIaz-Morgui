import { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({
  label,
  error,
  icon,
  id,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {rest.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-300 focus:border-red-500' : 'border-gray-300'}
          `.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}