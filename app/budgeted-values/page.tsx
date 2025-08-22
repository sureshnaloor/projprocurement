'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import BudgetedValueForm from '@/components/BudgetedValueForm'

interface BudgetedValue {
  _id: string
  projectName: string
  projectWbs: string
  materialServiceWbs: string
  materialService: string
  quantity: number
  unitOfMeasure: string
  budgetedValue: number
  remarks: string
  createdAt: string
  updatedAt: string
}

export default function BudgetedValuesPage() {
  const [budgetedValues, setBudgetedValues] = useState<BudgetedValue[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingValue, setEditingValue] = useState<BudgetedValue | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBudgetedValues = async () => {
    try {
      const response = await fetch('/api/budgeted-values')
      if (!response.ok) {
        throw new Error('Failed to fetch budgeted values')
      }
      const data = await response.json()
      setBudgetedValues(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch budgeted values',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgetedValues()
  }, [])

  const handleCreate = () => {
    setEditingValue(null)
    setIsFormOpen(true)
  }

  const handleEdit = (value: BudgetedValue) => {
    setEditingValue(value)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budgeted value?')) {
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/budgeted-values/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budgeted value')
      }

      toast({
        title: 'Success',
        description: 'Budgeted value deleted successfully',
      })

      fetchBudgetedValues()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete budgeted value',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchBudgetedValues()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Budgeted Values</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Budgeted Value
          </Button>
        </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Project WBS</TableHead>
              <TableHead>Material/Service WBS</TableHead>
              <TableHead>Material/Service</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Budgeted Value (SAR)</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetedValues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No budgeted values found
                </TableCell>
              </TableRow>
            ) : (
              budgetedValues.map((value) => (
                <TableRow key={value._id}>
                  <TableCell>{value.projectName}</TableCell>
                  <TableCell>{value.projectWbs}</TableCell>
                  <TableCell>{value.materialServiceWbs}</TableCell>
                  <TableCell>{value.materialService}</TableCell>
                  <TableCell>{value.quantity}</TableCell>
                  <TableCell>{value.unitOfMeasure}</TableCell>
                  <TableCell>{value.budgetedValue.toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {value.remarks}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(value)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(value._id)}
                        disabled={isDeleting === value._id}
                      >
                        {isDeleting === value._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? 'Edit Budgeted Value' : 'Create New Budgeted Value'}
            </DialogTitle>
          </DialogHeader>
          <BudgetedValueForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
            initialData={editingValue || undefined}
            isEditing={!!editingValue}
            budgetedValueId={editingValue?._id}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
