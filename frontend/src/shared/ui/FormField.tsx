/** FormField — Reusable form field component with Tailwind CSS. */


type FormFieldProps =
  | {
      label: string
      type: 'text'
      value: string
      onChange: (value: string) => void
      error?: string
      required?: boolean
      placeholder?: string
    }
  | {
      label: string
      type: 'checkbox'
      value: boolean
      onChange: (value: boolean) => void
      error?: string
      required?: boolean
    }
  | {
      label: string
      type: 'select'
      value: string | number | null
      onChange: (value: string | number | null) => void
      options: Array<{ value: string | number | null; label: string }>
      error?: string
      required?: boolean
      placeholder?: string
    }

export function FormField(props: FormFieldProps) {
  const { label, type, error, required } = props

  return (
    <div className="mb-4">
      {type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.value}
            onChange={(e) => props.onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {type === 'select' ? (
            <select
              value={props.value ?? ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') {
                  props.onChange(null)
                } else if (/^-?\d+$/.test(val)) {
                  props.onChange(Number(val))
                } else {
                  props.onChange(val)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{props.placeholder || 'Seleccionar...'}</option>
              {props.options.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value ?? '')}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              placeholder={props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}