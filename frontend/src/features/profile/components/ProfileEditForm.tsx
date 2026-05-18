import { useState, type FormEvent } from 'react'
import { useUpdatePerfil } from '@entities/api/perfilApi'
import { usePerfil } from '@entities/api/perfilApi'
import { validatePhone } from '@shared/utils/validators'

export function ProfileEditForm() {
  const { data: perfil } = usePerfil()
  const updatePerfil = useUpdatePerfil()

  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [telefono, setTelefono] = useState(perfil?.telefono ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    const phoneError = validatePhone(telefono)
    if (phoneError) {
      setError(phoneError)
      return
    }

    updatePerfil.mutate(
      { nombre: nombre.trim(), telefono: telefono.trim() || undefined },
      {
        onSuccess: () => {
          setError('')
        },
        onError: (err) => {
          setError(err.message || 'Error al actualizar el perfil')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <input
          value={perfil?.email ?? ''}
          disabled
          className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-400 cursor-not-allowed"
        />
        <p className="text-xs text-stone-400 mt-1">El email es tu identificador y no se puede cambiar</p>
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
        <input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+54911..."
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <button
        type="submit"
        disabled={updatePerfil.isPending}
        className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {updatePerfil.isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}