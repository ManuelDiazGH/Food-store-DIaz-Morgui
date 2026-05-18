import { usePerfil } from '@entities/api/perfilApi'

export function ProfileView() {
  const { data: perfil, isLoading, error } = usePerfil()

  if (isLoading) return <p className="text-stone-400">Cargando perfil...</p>
  if (error) return <p className="text-red-500">Error al cargar el perfil</p>
  if (!perfil) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-500">Nombre</label>
          <p className="mt-1 text-lg text-stone-900">{perfil.nombre}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-500">Email</label>
          <p className="mt-1 text-lg text-stone-900">{perfil.email}</p>
          <p className="text-xs text-stone-400">El email no se puede cambiar</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-500">Teléfono</label>
          <p className="mt-1 text-lg text-stone-900">{perfil.telefono || 'No especificado'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-500">Fecha de registro</label>
          <p className="mt-1 text-lg text-stone-900">{new Date(perfil.fecha_registro).toLocaleDateString('es-AR')}</p>
        </div>
      </div>
    </div>
  )
}