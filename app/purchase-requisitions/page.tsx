import PRList from '@/components/PRList'
import Header from '@/components/Header'

export default function PurchaseRequisitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-6">
        <PRList />
      </div>
    </div>
  )
}
