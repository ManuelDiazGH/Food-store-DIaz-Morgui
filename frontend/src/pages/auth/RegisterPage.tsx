import { RegisterForm } from '@features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">🍔 Food Store</h1>
          <p className="text-gray-600">Creá tu cuenta</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}