import ProtectedRoute from '@/components/ProtectedRoute'
import PRList from '@/components/PRList'

export default function PurchaseRequisitions() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <PRList />
        </div>
      </div>
    </ProtectedRoute>
  )
}
