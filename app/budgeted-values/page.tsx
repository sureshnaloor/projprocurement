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
import { Plus, Edit, Trash2, Loader2, FileText, Eye, Search } from 'lucide-react'
import BudgetedValueForm from '@/components/BudgetedValueForm'
import PRForm from '@/components/PRForm'
import BudgetedValuePRs from '@/components/BudgetedValuePRs'

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
  // Progress tracking fields (will be calculated)
  totalPRValue?: number
  totalPOValue?: number
  budgetUtilization?: number
  poUtilization?: number
}

export default function BudgetedValuesPage() {
  const [budgetedValues, setBudgetedValues] = useState<BudgetedValue[]>([])
  const [filteredBudgetedValues, setFilteredBudgetedValues] = useState<BudgetedValue[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingValue, setEditingValue] = useState<BudgetedValue | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedBudgetedValue, setSelectedBudgetedValue] = useState<BudgetedValue | null>(null)
  const [isPRFormOpen, setIsPRFormOpen] = useState(false)
  const [isPRsViewOpen, setIsPRsViewOpen] = useState(false)
  const [viewingBudgetedValue, setViewingBudgetedValue] = useState<BudgetedValue | null>(null)
  const { toast } = useToast()

  const fetchBudgetedValues = async () => {
    try {
      const response = await fetch('/api/budgeted-values')
      if (!response.ok) {
        throw new Error('Failed to fetch budgeted values')
      }
      const data = await response.json()
      
             // Fetch progress data for each budgeted value
       const budgetedValuesWithProgress = await Promise.all(
         data.map(async (value: BudgetedValue) => {
           try {
             const prResponse = await fetch(`/api/purchase-requisitions?budgetedValueId=${value._id}`)
             if (prResponse.ok) {
               const prData = await prResponse.json()
               const prs = prData.data || []
               
               console.log(`Found ${prs.length} PRs for budgeted value ${value._id}:`, prs)
               
               const totalPRValue = prs.reduce((sum: number, pr: any) => sum + pr.prValue, 0)
               const totalPOValue = prs.reduce((sum: number, pr: any) => sum + (pr.poValue || 0), 0)
               const budgetUtilization = (totalPRValue / value.budgetedValue) * 100
               const poUtilization = (totalPOValue / value.budgetedValue) * 100
               
               return {
                 ...value,
                 totalPRValue,
                 totalPOValue,
                 budgetUtilization,
                 poUtilization
               }
             }
             return value
           } catch (error) {
             console.error('Error fetching progress for budgeted value:', error)
             return value
           }
         })
       )
      
      setBudgetedValues(budgetedValuesWithProgress)
      setFilteredBudgetedValues(budgetedValuesWithProgress)
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

  // Filter budgeted values based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBudgetedValues(budgetedValues)
    } else {
      const filtered = budgetedValues.filter((value) =>
        value.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.projectWbs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.materialServiceWbs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.materialService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBudgetedValues(filtered)
    }
  }, [searchTerm, budgetedValues])

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

  const handleCreatePR = (budgetedValue: BudgetedValue) => {
    setSelectedBudgetedValue(budgetedValue)
    setIsPRFormOpen(true)
  }

  const handlePRFormSuccess = () => {
    setIsPRFormOpen(false)
    setSelectedBudgetedValue(null)
    // Refresh the budgeted values to update progress bars
    fetchBudgetedValues()
  }

  const handleViewPRs = (budgetedValue: BudgetedValue) => {
    setViewingBudgetedValue(budgetedValue)
    setIsPRsViewOpen(true)
  }

  const handlePRsViewClose = () => {
    setIsPRsViewOpen(false)
    setViewingBudgetedValue(null)
    // Refresh the budgeted values to update progress bars
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
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Budgeted Values</h1>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Budgeted Value
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by project name, WBS, material/service, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium">Project Name</TableHead>
              <TableHead className="text-xs font-medium">Project WBS</TableHead>
              <TableHead className="text-xs font-medium">Material/Service WBS</TableHead>
              <TableHead className="text-xs font-medium">Material/Service</TableHead>
              <TableHead className="text-xs font-medium">Quantity</TableHead>
              <TableHead className="text-xs font-medium">Unit</TableHead>
              <TableHead className="text-xs font-medium">Budgeted Value (SAR)</TableHead>
              <TableHead className="text-xs font-medium">Progress</TableHead>
              <TableHead className="text-xs font-medium">Remarks</TableHead>
              <TableHead className="text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgetedValues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-gray-500 text-sm">
                  {searchTerm ? 'No budgeted values found matching your search' : 'No budgeted values found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredBudgetedValues.map((value) => (
                <TableRow key={value._id}>
                  <TableCell className="text-xs py-2">{value.projectName}</TableCell>
                  <TableCell className="text-xs py-2">{value.projectWbs}</TableCell>
                  <TableCell className="text-xs py-2">{value.materialServiceWbs}</TableCell>
                  <TableCell className="text-xs py-2">{value.materialService}</TableCell>
                  <TableCell className="text-xs py-2">{value.quantity}</TableCell>
                  <TableCell className="text-xs py-2">{value.unitOfMeasure}</TableCell>
                  <TableCell className="text-xs py-2">{value.budgetedValue.toLocaleString()}</TableCell>
                  <TableCell className="py-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Budget: <span className={((value.totalPRValue || 0) / value.budgetedValue * 100) > 100 ? 'text-red-600 font-semibold' : ''}>{((value.totalPRValue || 0) / value.budgetedValue * 100).toFixed(1)}%</span></span>
                        <span>{(value.totalPRValue || 0).toLocaleString()} / {value.budgetedValue.toLocaleString()}</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(((value.totalPRValue || 0) / value.budgetedValue * 100), 100)}%` }}
                        ></div>
                        {((value.totalPRValue || 0) / value.budgetedValue * 100) > 100 && (
                          <div 
                            className="bg-red-500 h-1.5 rounded-full absolute top-0 transition-all duration-300" 
                            style={{ 
                              left: '100%', 
                              width: `${Math.max(((value.totalPRValue || 0) / value.budgetedValue * 100) - 100, 0)}%`,
                              maxWidth: 'calc(100% - 100%)'
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>PO: <span className={((value.totalPOValue || 0) / value.budgetedValue * 100) > 100 ? 'text-red-600 font-semibold' : ''}>{((value.totalPOValue || 0) / value.budgetedValue * 100).toFixed(1)}%</span></span>
                        <span>{(value.totalPOValue || 0).toLocaleString()} / {value.budgetedValue.toLocaleString()}</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(((value.totalPOValue || 0) / value.budgetedValue * 100), 100)}%` }}
                        ></div>
                        {((value.totalPOValue || 0) / value.budgetedValue * 100) > 100 && (
                          <div 
                            className="bg-red-500 h-1.5 rounded-full absolute top-0 transition-all duration-300" 
                            style={{ 
                              left: '100%', 
                              width: `${Math.max(((value.totalPOValue || 0) / value.budgetedValue * 100) - 100, 0)}%`,
                              maxWidth: 'calc(100% - 100%)'
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs py-2">
                    {value.remarks}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(value)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreatePR(value)}
                        className="h-7 w-7 p-0"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPRs(value)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(value._id)}
                        disabled={isDeleting === value._id}
                        className="h-7 w-7 p-0"
                      >
                        {isDeleting === value._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
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

               {/* PR Form Modal */}
        <PRForm
          isOpen={isPRFormOpen}
          onClose={() => setIsPRFormOpen(false)}
          onSuccess={handlePRFormSuccess}
          budgetedValueId={selectedBudgetedValue?._id}
        />

        {/* Budgeted Value PRs Modal */}
        {viewingBudgetedValue && (
          <BudgetedValuePRs
            isOpen={isPRsViewOpen}
            onClose={handlePRsViewClose}
            budgetedValue={viewingBudgetedValue}
            onPRUpdate={fetchBudgetedValues}
          />
        )}
       </div>
     </div>
   )
 }
