'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react'
import PRForm from './PRForm'
import PRDetails from './PRDetails'

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
  communication: Array<{
    user: string
    timestamp: string
    log: string
  }>
  createdAt: string
  updatedAt: string
}

export default function PRList() {
  const [prs, setPrs] = useState<PurchaseRequisition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedPr, setSelectedPr] = useState<PurchaseRequisition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Fetch purchase requisitions
  const fetchPRs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('prNumber', searchTerm)
      }
      
      const response = await fetch(`/api/purchase-requisitions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch purchase requisitions')
      }
      
      const result = await response.json()
      setPrs(result.data || [])
    } catch (error) {
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
    fetchPRs()
  }, [searchTerm])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase requisition?')) {
      return
    }

    try {
      const response = await fetch(`/api/purchase-requisitions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete purchase requisition')
      }

      toast({
        title: 'Success',
        description: 'Purchase requisition deleted successfully',
      })

      fetchPRs()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete purchase requisition',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (pr: PurchaseRequisition) => {
    setSelectedPr(pr)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleView = (pr: PurchaseRequisition) => {
    setSelectedPr(pr)
    setIsDetailsOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setIsEditing(false)
    setSelectedPr(null)
  }

  const handleFormSuccess = () => {
    fetchPRs()
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

  const filteredPRs = prs.filter(pr => 
    pr.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.materialService.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header and Search Section with darker background */}
      <div className="bg-stone-50 rounded-lg p-6 mb-6 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Purchase Requisitions</h1>
            <p className="text-sm text-stone-600 font-medium">Manage and track all purchase requisitions</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New PR
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
          <Input
            placeholder="Search by project name, PR number, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm bg-white border-stone-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow border border-stone-200">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50">
                <TableHead className="text-xs font-medium text-stone-700">PR Number</TableHead>
                <TableHead className="text-xs font-medium text-stone-700">Project</TableHead>
                <TableHead className="text-xs font-medium text-stone-700">Material/Service</TableHead>
                <TableHead className="text-xs font-medium text-stone-700">PR Value (SAR)</TableHead>
                <TableHead className="text-xs font-medium text-stone-700">Status</TableHead>
                <TableHead className="text-xs font-medium text-stone-700">Created</TableHead>
                <TableHead className="text-xs font-medium text-stone-700 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-stone-500 text-sm">
                    {searchTerm ? 'No purchase requisitions found matching your search' : 'No purchase requisitions found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPRs.map((pr) => (
                  <TableRow key={pr._id} className="hover:bg-stone-50 transition-colors duration-200">
                    <TableCell className="text-xs py-3 text-stone-700 font-medium">
                      {pr.prNumber}-{pr.lineItemNumber}
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <div className="text-xs font-medium text-stone-700">{pr.projectName}</div>
                        <div className="text-xs text-stone-500">
                          {pr.projectWbs}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <div className="text-xs font-medium text-stone-700">{pr.materialService}</div>
                        <div className="text-xs text-stone-500">
                          {pr.materialServiceWbs}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-3 text-stone-700 font-medium">
                      {pr.prValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3">
                      {getStatusBadge(pr)}
                    </TableCell>
                    <TableCell className="text-xs py-3 text-stone-600">
                      {new Date(pr.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(pr)}
                          className="h-7 w-7 p-0 border-stone-300 hover:border-blue-500 hover:bg-blue-50"
                        >
                          <Eye className="h-3 w-3 text-stone-600 hover:text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pr)}
                          className="h-7 w-7 p-0 border-stone-300 hover:border-green-500 hover:bg-green-50"
                        >
                          <Edit className="h-3 w-3 text-stone-600 hover:text-green-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(pr._id)}
                          className="h-7 w-7 p-0 border-stone-300 hover:border-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 text-stone-600 hover:text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* PR Form Dialog */}
      <PRForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        initialData={selectedPr || undefined}
        isEditing={isEditing}
        prId={selectedPr?._id}
      />

      {/* PR Details Dialog */}
      {selectedPr && (
        <PRDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          pr={selectedPr}
          onUpdate={fetchPRs}
        />
      )}
    </div>
  )
}
