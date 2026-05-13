import { useState } from 'react'
import { ProfileView } from '@features/profile/components/ProfileView'
import { ProfileEditForm } from '@features/profile/components/ProfileEditForm'
import { PasswordChangeForm } from '@features/profile/components/PasswordChangeForm'

type Tab = 'view' | 'edit' | 'password'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('view')

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'view', label: 'Mi Perfil' },
    { key: 'edit', label: 'Editar' },
    { key: 'password', label: 'Contraseña' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'view' && <ProfileView />}
        {activeTab === 'edit' && <ProfileEditForm />}
        {activeTab === 'password' && <PasswordChangeForm />}
      </div>
    </div>
  )
}