'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import BudgetedValuesPage from '@/components/BudgetedValuesPage'

export default function BudgetedValues() {
  return (
    <ProtectedRoute>
      <BudgetedValuesPage />
    </ProtectedRoute>
  )
}
