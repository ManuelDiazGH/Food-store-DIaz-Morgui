import { LoginForm } from '@features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center text-lg font-bold">FS</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Food Store</h1>
          <p className="text-stone-600">Ingresá a tu cuenta</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}