'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Loader2, FileText, TrendingUp, DollarSign, Edit } from 'lucide-react'
import PRForm from './PRForm'

interface PurchaseRequisition {
  _id: string
  projectName: string
  projectWbs: string
  materialServiceWbs: string
  materialService: string
  budget: number
  prNumber: string
  lineItemNumber: string
  prDate: string
  prValue: number
  poNumber?: string
  poDate?: string
  poValue?: number
  poCompleted: boolean
  poCreated: boolean
  remarks?: string
  createdAt: string
  updatedAt: string
}

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

interface BudgetedValuePRsProps {
  isOpen: boolean
  onClose: () => void
  budgetedValue: BudgetedValue
  onPRUpdate?: () => void
}

export default function BudgetedValuePRs({ isOpen, onClose, budgetedValue, onPRUpdate }: BudgetedValuePRsProps) {
  const [prs, setPrs] = useState<PurchaseRequisition[]>([])
  const [loading, setLoading] = useState(true)
  const [isPRFormOpen, setIsPRFormOpen] = useState(false)
  const [editingPR, setEditingPR] = useState<PurchaseRequisition | null>(null)
  const { toast } = useToast()

  // Calculate totals
  const totalPRValue = prs.reduce((sum, pr) => sum + pr.prValue, 0)
  const totalPOValue = prs.reduce((sum, pr) => sum + (pr.poValue || 0), 0)
  const budgetUtilization = (totalPRValue / budgetedValue.budgetedValue) * 100
  const poUtilization = (totalPOValue / budgetedValue.budgetedValue) * 100

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/purchase-requisitions?budgetedValueId=${budgetedValue._id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch purchase requisitions')
      }
      const result = await response.json()
      setPrs(result.data || [])
    } catch (error) {
      console.error('Error fetching PRs:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase requisitions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPRs()
    }
  }, [isOpen, budgetedValue._id])

  const handleCreatePR = () => {
    setEditingPR(null)
    setIsPRFormOpen(true)
  }

  const handleEditPR = (pr: PurchaseRequisition) => {
    setEditingPR(pr)
    setIsPRFormOpen(true)
  }

  const handlePRFormSuccess = () => {
    setIsPRFormOpen(false)
    setEditingPR(null)
    fetchPRs()
    // Notify parent component to refresh progress bars
    if (onPRUpdate) {
      onPRUpdate()
    }
  }

  const getStatusBadge = (pr: PurchaseRequisition) => {
    if (pr.poCompleted) {
      return <Badge variant="success">Completed</Badge>
    }
    if (pr.poCreated) {
      return <Badge variant="default">PO Created</Badge>
    }
    return <Badge variant="warning">Pending</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Requisitions for Budgeted Value
          </DialogTitle>
          <DialogDescription>
            {budgetedValue.projectName} - {budgetedValue.materialService}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{budgetedValue.budgetedValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">SAR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total PR Value</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPRValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">SAR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total PO Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPOValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">SAR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(budgetedValue.budgetedValue - totalPRValue).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">SAR</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Budget Utilization</span>
                <span className={`text-sm ${budgetUtilization > 100 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>{budgetUtilization.toFixed(1)}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                ></div>
                {budgetUtilization > 100 && (
                  <div 
                    className="bg-red-500 h-2 rounded-full absolute top-0 transition-all duration-300" 
                    style={{ 
                      left: '100%', 
                      width: `${budgetUtilization - 100}%`,
                      maxWidth: 'calc(100% - 100%)'
                    }}
                  ></div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPRValue.toLocaleString()} / {budgetedValue.budgetedValue.toLocaleString()} SAR
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">PO Progress (vs Budget)</span>
                <span className={`text-sm ${poUtilization > 100 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>{poUtilization.toFixed(1)}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(poUtilization, 100)}%` }}
                ></div>
                {poUtilization > 100 && (
                  <div 
                    className="bg-red-500 h-2 rounded-full absolute top-0 transition-all duration-300" 
                    style={{ 
                      left: '100%', 
                      width: `${poUtilization - 100}%`,
                      maxWidth: 'calc(100% - 100%)'
                    }}
                  ></div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPOValue.toLocaleString()} / {budgetedValue.budgetedValue.toLocaleString()} SAR
              </p>
            </div>
          </div>

          {/* PR List Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Purchase Requisitions ({prs.length})</h3>
            <Button onClick={handleCreatePR} className="gap-2">
              <Plus className="h-4 w-4" />
              Create PR
            </Button>
          </div>

          {/* PR Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR Number</TableHead>
                    <TableHead>PR Date</TableHead>
                    <TableHead>PR Value (SAR)</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>PO Date</TableHead>
                    <TableHead>PO Value (SAR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No purchase requisitions found for this budgeted value
                      </TableCell>
                    </TableRow>
                  ) : (
                    prs.map((pr) => (
                      <TableRow key={pr._id}>
                        <TableCell className="font-medium">
                          {pr.prNumber}-{pr.lineItemNumber}
                        </TableCell>
                        <TableCell>{pr.prDate}</TableCell>
                        <TableCell>{pr.prValue.toLocaleString()}</TableCell>
                        <TableCell>{pr.poNumber || '-'}</TableCell>
                        <TableCell>{pr.poDate || '-'}</TableCell>
                        <TableCell>{pr.poValue ? pr.poValue.toLocaleString() : '-'}</TableCell>
                        <TableCell>{getStatusBadge(pr)}</TableCell>
                        <TableCell>
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPR(pr)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* PR Form Modal */}
        <PRForm
          isOpen={isPRFormOpen}
          onClose={() => setIsPRFormOpen(false)}
          onSuccess={handlePRFormSuccess}
          budgetedValueId={budgetedValue._id}
          initialData={editingPR || undefined}
          isEditing={!!editingPR}
          prId={editingPR?._id}
        />
      </DialogContent>
    </Dialog>
  )
}
