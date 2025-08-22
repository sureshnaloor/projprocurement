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
  budget: number
  prNumber: string
  lineItemNumber: string
  prMaterialServiceCode: string
  prMaterialServiceDescription: string
  quantity: number
  unitOfMeasure: string
  materialServiceValueSar: number
  prConvertedToPo: boolean
  poNumber?: string
  poLineItem?: string
  poDelivered: boolean
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
    if (pr.poDelivered) {
      return <Badge variant="success">Delivered</Badge>
    }
    if (pr.prConvertedToPo) {
      return <Badge variant="default">PO Created</Badge>
    }
    return <Badge variant="warning">Pending</Badge>
  }

  const filteredPRs = prs.filter(pr => 
    pr.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.prMaterialServiceDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Requisitions</CardTitle>
              <CardDescription>
                Manage and track all purchase requisitions
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New PR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project name, PR number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
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
                    <TableHead>Project</TableHead>
                    <TableHead>Material/Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value (SAR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPRs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No purchase requisitions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPRs.map((pr) => (
                      <TableRow key={pr._id}>
                        <TableCell className="font-medium">
                          {pr.prNumber}-{pr.lineItemNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pr.projectName}</div>
                            <div className="text-sm text-muted-foreground">
                              {pr.projectWbs}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pr.prMaterialServiceCode}</div>
                            <div className="text-sm text-muted-foreground">
                              {pr.prMaterialServiceDescription.length > 50
                                ? `${pr.prMaterialServiceDescription.substring(0, 50)}...`
                                : pr.prMaterialServiceDescription}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pr.quantity} {pr.unitOfMeasure}
                        </TableCell>
                        <TableCell>
                          {pr.materialServiceValueSar.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(pr)}</TableCell>
                        <TableCell>
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(pr)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(pr)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(pr._id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
