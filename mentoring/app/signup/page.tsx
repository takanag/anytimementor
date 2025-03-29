import SignupForm from "@/components/signup-form"
import ProtectedRoute from "@/components/protected-route"

export default function SignupPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <SignupForm />
      </div>
    </ProtectedRoute>
  )
}

