'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

// Validation schema
const prFormSchema = z.object({
  budgetedValueId: z.string().optional().or(z.any()),
  projectName: z.string().min(1, 'Project name is required'),
  projectWbs: z.string().min(1, 'Project WBS is required'),
  materialServiceWbs: z.string().min(1, 'Material/Service WBS is required'),
  materialService: z.string().min(1, 'Material/Service is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  prNumber: z.string().min(1, 'PR number is required'),
  lineItemNumber: z.string().min(1, 'Line item number is required'),
  prDate: z.string().min(1, 'PR date is required'),
  prValue: z.number().min(0, 'PR value must be positive'),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  poValue: z.number().min(0, 'PO value must be positive').optional(),
  poCompleted: z.boolean().default(false),
  poCreated: z.boolean().default(false),
  remarks: z.string().optional(),
}).refine((data) => {
  // If any PO field is filled, all PO fields are required
  const hasAnyPOField = data.poNumber?.trim() || data.poDate?.trim() || (data.poValue && data.poValue > 0)
  if (hasAnyPOField) {
    return data.poNumber?.trim() && data.poDate?.trim() && data.poValue && data.poValue > 0
  }
  return true
}, {
  message: "All PO fields (Number, Date, Value) are required when any PO field is filled",
  path: ["poNumber"]
}).refine((data) => {
  // When PO is created, PR value should equal PO value
  if (data.poCreated && data.poValue && data.poValue > 0) {
    return data.prValue === data.poValue
  }
  return true
}, {
  message: "PR Value must equal PO Value when PO is created",
  path: ["prValue"]
})

type PRFormData = z.infer<typeof prFormSchema>

interface PRFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Partial<PRFormData>
  isEditing?: boolean
  prId?: string
  budgetedValueId?: string
}

export default function PRForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
  prId,
  budgetedValueId
}: PRFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<PRFormData>({
    resolver: zodResolver(prFormSchema),
    defaultValues: {
      budgetedValueId: initialData?.budgetedValueId || budgetedValueId || '',
      projectName: initialData?.projectName || '',
      projectWbs: initialData?.projectWbs || '',
      materialServiceWbs: initialData?.materialServiceWbs || '',
      materialService: initialData?.materialService || '',
      budget: initialData?.budget || 0,
      prNumber: initialData?.prNumber || '',
      lineItemNumber: initialData?.lineItemNumber || '',
      prDate: initialData?.prDate || '',
      prValue: initialData?.prValue || 0,
      poNumber: initialData?.poNumber || '',
      poDate: initialData?.poDate || '',
      poValue: initialData?.poValue,
      poCompleted: initialData?.poCompleted || false,
      poCreated: initialData?.poCreated || false,
      remarks: initialData?.remarks || '',
    },
  })

  // Watch PO fields to auto-update PR value and PO Created status
  const poCreated = form.watch('poCreated')
  const poValue = form.watch('poValue')
  const poNumber = form.watch('poNumber')
  const poDate = form.watch('poDate')

  // Auto-update PR value when PO is created and PO value changes
  useEffect(() => {
    if (poCreated && poValue !== undefined && poValue > 0) {
      form.setValue('prValue', poValue)
    }
  }, [poCreated, poValue, form])

  // Auto-check/uncheck PO Created based on whether all PO fields are filled
  useEffect(() => {
    const allPOFieldsFilled = poNumber?.trim() && poDate?.trim() && poValue !== undefined && poValue > 0
    const currentPoCreated = form.getValues('poCreated')
    
    if (allPOFieldsFilled && !currentPoCreated) {
      form.setValue('poCreated', true)
    } else if (!allPOFieldsFilled && currentPoCreated) {
      form.setValue('poCreated', false)
    }
  }, [poNumber, poDate, poValue, form])

  // Load budgeted value data if budgetedValueId is provided
  useEffect(() => {
    if (budgetedValueId && isOpen && !isEditing) {
      fetchBudgetedValue(budgetedValueId)
    }
  }, [budgetedValueId, isOpen, isEditing])

  const fetchBudgetedValue = async (id: string) => {
    try {
      const response = await fetch(`/api/budgeted-values/${id}`)
      if (response.ok) {
        const data = await response.json()
        form.reset({
          budgetedValueId: id,
          projectName: data.projectName,
          projectWbs: data.projectWbs,
          materialServiceWbs: data.materialServiceWbs,
          materialService: data.materialService,
          budget: data.budgetedValue,
          prNumber: '',
          lineItemNumber: '',
          prDate: '',
          prValue: 0,
          poNumber: '',
          poDate: '',
          poValue: 0,
          poCompleted: false,
          poCreated: false,
          remarks: '',
        })
      }
    } catch (error) {
      console.error('Error fetching budgeted value:', error)
    }
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && !isEditing && !budgetedValueId) {
      // Reset form to default values when opening for new PR (without budgeted value)
      form.reset({
        budgetedValueId: '',
        projectName: '',
        projectWbs: '',
        materialServiceWbs: '',
        materialService: '',
        budget: 0,
        prNumber: '',
        lineItemNumber: '',
        prDate: '',
        prValue: 0,
        poNumber: '',
        poDate: '',
        poValue: 0,
        poCompleted: false,
        poCreated: false,
        remarks: '',
      })
    } else if (isOpen && isEditing && initialData) {
      // Set form data for editing - this takes priority
      form.reset(initialData)
    }
  }, [isOpen, form, isEditing, initialData, budgetedValueId])

  const onSubmit = async (data: PRFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditing && prId 
        ? `/api/purchase-requisitions/${prId}`
        : '/api/purchase-requisitions'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save purchase requisition')
      }

      toast({
        title: 'Success',
        description: `Purchase requisition ${isEditing ? 'updated' : 'created'} successfully`,
      })

      form.reset()
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} purchase requisition`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Information (Read-only from budgeted value) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Information</h3>
                
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectWbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project WBS</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materialServiceWbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material/Service WBS</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materialService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material/Service</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (SAR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          readOnly
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* PR Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PR Information</h3>
                
                                 <FormField
                   control={form.control}
                   name="prNumber"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>PR Number</FormLabel>
                       <FormControl>
                         <Input placeholder="Enter PR number" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="lineItemNumber"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Line Item Number</FormLabel>
                       <FormControl>
                         <Input placeholder="Enter line item number" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="prDate"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>PR Date</FormLabel>
                       <FormControl>
                         <Input type="date" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="prValue"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>PR Value (SAR)</FormLabel>
                       <FormControl>
                         <Input 
                           type="number" 
                           placeholder="Enter PR value"
                           {...field}
                           onChange={(e) => field.onChange(Number(e.target.value))}
                           disabled={poCreated && poValue !== undefined && poValue > 0}
                         />
                       </FormControl>
                       <FormMessage />
                       {poCreated && poValue !== undefined && poValue > 0 && (
                         <p className="text-sm text-muted-foreground">
                           PR Value automatically set to PO Value when PO is created
                         </p>
                       )}
                     </FormItem>
                   )}
                 />
              </div>
            </div>

                         {/* PO Information */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold">PO Information (Optional)</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                   control={form.control}
                   name="poNumber"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className={poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "text-red-600" : ""}>
                         PO Number {poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "*" : ""}
                       </FormLabel>
                       <FormControl>
                         <Input placeholder="Enter PO number" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="poDate"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className={poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "text-red-600" : ""}>
                         PO Date {poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "*" : ""}
                       </FormLabel>
                       <FormControl>
                         <Input type="date" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="poValue"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className={poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "text-red-600" : ""}>
                         PO Value (SAR) {poNumber?.trim() || poDate?.trim() || (poValue !== undefined && poValue > 0) ? "*" : ""}
                       </FormLabel>
                       <FormControl>
                         <Input 
                           type="number" 
                           placeholder="Enter PO value"
                           {...field}
                           onChange={(e) => field.onChange(Number(e.target.value))}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

                               <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="poCreated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              // Auto-update PR value when PO Created is checked
                              if (checked && poValue !== undefined && poValue > 0) {
                                form.setValue('prValue', poValue)
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>PO Created (Auto-checked when all PO fields are filled)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="poCompleted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>PO Completed</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
             </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional remarks"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Create'} PR
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
