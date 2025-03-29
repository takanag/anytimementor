import LoginForm from "@/components/login-form"
import ProtectedRoute from "@/components/protected-route"

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <LoginForm />
      </div>
    </ProtectedRoute>
  )
}

