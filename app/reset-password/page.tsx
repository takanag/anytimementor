import ResetPasswordForm from "@/components/reset-password-form"
import ProtectedRoute from "@/components/protected-route"

export default function ResetPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ResetPasswordForm />
      </div>
    </ProtectedRoute>
  )
}

