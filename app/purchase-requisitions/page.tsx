import PRList from '@/components/PRList'
import Header from '@/components/Header'

export default function PurchaseRequisitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Purchase Requisitions</h1>
          <p className="text-muted-foreground">
            Create, manage, and track all purchase requisitions for your projects
          </p>
        </div> */}
        <PRList />
      </main>
    </div>
  )
}
