'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, Send } from 'lucide-react'

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

interface PRDetailsProps {
  isOpen: boolean
  onClose: () => void
  pr: PurchaseRequisition
  onUpdate: () => void
}

export default function PRDetails({ isOpen, onClose, pr, onUpdate }: PRDetailsProps) {
  const [newLog, setNewLog] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAddCommunication = async () => {
    if (!newLog.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/purchase-requisitions/${pr._id}/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'Current User', // Replace with actual user from auth
          log: newLog.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add communication log')
      }

      toast({
        title: 'Success',
        description: 'Communication log added successfully',
      })

      setNewLog('')
      onUpdate()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add communication log',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Purchase Requisition Details
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            PR Number: {pr.prNumber}-{pr.lineItemNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                <p className="text-sm">{pr.projectName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project WBS</label>
                <p className="text-sm">{pr.projectWbs}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material/Service WBS</label>
                <p className="text-sm">{pr.materialServiceWbs}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget (SAR)</label>
                <p className="text-sm">{pr.budget.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* PR Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PR Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">PR Number</label>
                <p className="text-sm">{pr.prNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Line Item Number</label>
                <p className="text-sm">{pr.lineItemNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PR Date</label>
                <p className="text-sm">{pr.prDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material/Service</label>
                <p className="text-sm">{pr.materialService}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PR Value (SAR)</label>
                <p className="text-sm">{pr.prValue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* PO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PO Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Created</label>
                <p className="text-sm">{pr.poCreated ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Completed</label>
                <p className="text-sm">{pr.poCompleted ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                <p className="text-sm">{pr.poNumber || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Date</label>
                <p className="text-sm">{pr.poDate || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Value (SAR)</label>
                <p className="text-sm">{pr.poValue ? pr.poValue.toLocaleString() : 'Not assigned'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          {pr.remarks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{pr.remarks}</p>
              </CardContent>
            </Card>
          )}

          {/* Communication Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication Logs
              </CardTitle>
              <CardDescription>
                Track all communications and updates for this PR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new communication */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a communication log..."
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddCommunication()
                    }
                  }}
                />
                <Button 
                  onClick={handleAddCommunication}
                  disabled={!newLog.trim() || isSubmitting}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Communication history */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {pr.communication.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No communication logs yet
                  </p>
                ) : (
                  pr.communication
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((comm, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{comm.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comm.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comm.log}</p>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{new Date(pr.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{new Date(pr.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
