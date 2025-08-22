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
import { Autocomplete } from '@/components/ui/autocomplete'
import { PrefixInput } from '@/components/ui/prefix-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

// Validation schema
const prFormSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectWbs: z.string().min(1, 'Project WBS is required'),
  materialServiceWbs: z.string().min(1, 'Material/Service WBS is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  prNumber: z.string().min(1, 'PR number is required'),
  lineItemNumber: z.string().min(1, 'Line item number is required'),
  prMaterialServiceCode: z.string().min(1, 'Material/Service code is required'),
  prMaterialServiceDescription: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  materialServiceValueSar: z.number().min(0, 'Value must be positive'),
  prConvertedToPo: z.boolean().default(false),
  poNumber: z.string().optional(),
  poLineItem: z.string().optional(),
  poDelivered: z.boolean().default(false),
  remarks: z.string().optional(),
}).refine((data) => {
  // If PR is converted to PO, PO number and line item are required
  if (data.prConvertedToPo) {
    return data.poNumber && data.poNumber.trim().length > 0 && 
           data.poLineItem && data.poLineItem.trim().length > 0
  }
  return true
}, {
  message: "PO Number and PO Line Item are required when PR is converted to PO",
  path: ["poNumber"] // This will show the error on the PO Number field
})

type PRFormData = z.infer<typeof prFormSchema>

interface PRFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Partial<PRFormData>
  isEditing?: boolean
  prId?: string
}

export default function PRForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
  prId
}: PRFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Handle cross-population when project or WBS is selected
  const handleProjectSelection = (option: any) => {
    if (option.wbs) {
      form.setValue('projectWbs', option.wbs)
      // Auto-prefix material/service WBS with first 12 characters of project WBS
      const prefix = option.wbs.substring(0, 12)
      const currentMaterialWbs = form.getValues('materialServiceWbs')
      if (!currentMaterialWbs || currentMaterialWbs.length < 12) {
        form.setValue('materialServiceWbs', prefix)
      }
    }
  }

  const handleWbsSelection = (option: any) => {
    if (option.projectName) {
      form.setValue('projectName', option.projectName)
    }
    // Auto-prefix material/service WBS with first 12 characters of selected WBS
    const prefix = option.value.substring(0, 12)
    const currentMaterialWbs = form.getValues('materialServiceWbs')
    if (!currentMaterialWbs || currentMaterialWbs.length < 12) {
      form.setValue('materialServiceWbs', prefix)
    }
  }

  const form = useForm<PRFormData>({
    resolver: zodResolver(prFormSchema),
    defaultValues: {
      projectName: initialData?.projectName || '',
      projectWbs: initialData?.projectWbs || '',
      materialServiceWbs: initialData?.materialServiceWbs || '',
      budget: initialData?.budget || 0,
      prNumber: initialData?.prNumber || '',
      lineItemNumber: initialData?.lineItemNumber || '',
      prMaterialServiceCode: initialData?.prMaterialServiceCode || '',
      prMaterialServiceDescription: initialData?.prMaterialServiceDescription || '',
      quantity: initialData?.quantity || 0,
      unitOfMeasure: initialData?.unitOfMeasure || '',
      materialServiceValueSar: initialData?.materialServiceValueSar || 0,
      prConvertedToPo: initialData?.prConvertedToPo || false,
      poNumber: initialData?.poNumber || '',
      poLineItem: initialData?.poLineItem || '',
      poDelivered: initialData?.poDelivered || false,
      remarks: initialData?.remarks || '',
    },
  })

  // Reset form when modal opens/closes (only for new PRs, not editing)
  useEffect(() => {
    if (isOpen && !isEditing) {
      // Reset form to default values when opening for new PR
      form.reset({
        projectName: '',
        projectWbs: '',
        materialServiceWbs: '',
        budget: 0,
        prNumber: '',
        lineItemNumber: '',
        prMaterialServiceCode: '',
        prMaterialServiceDescription: '',
        quantity: 0,
        unitOfMeasure: '',
        materialServiceValueSar: 0,
        prConvertedToPo: false,
        poNumber: '',
        poLineItem: '',
        poDelivered: false,
        remarks: '',
      })
    } else if (isOpen && isEditing && initialData) {
      // Set form data for editing
      form.reset(initialData)
    }
  }, [isOpen, form, isEditing, initialData])

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
              {/* Project Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Information</h3>
                
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Autocomplete
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search and select project name"
                          type="project"
                          disabled={isSubmitting}
                          onSelectionChange={handleProjectSelection}
                        />
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
                        <Autocomplete
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search and select project WBS"
                          type="wbs"
                          disabled={isSubmitting}
                          onSelectionChange={handleWbsSelection}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materialServiceWbs"
                  render={({ field }) => {
                    const projectWbs = form.getValues('projectWbs')
                    const prefix = projectWbs ? projectWbs.substring(0, 12) : ''
                    
                    return (
                      <FormItem>
                        <FormLabel>Material/Service WBS</FormLabel>
                        <FormControl>
                                                     <PrefixInput
                             value={field.value}
                             onChange={field.onChange}
                             prefix={prefix}
                             disabled={isSubmitting}
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
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
                          placeholder="Enter budget amount"
                          {...field}
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
                  name="prMaterialServiceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material/Service Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter material/service code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prMaterialServiceDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material/Service Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter description"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., KG, PCS, M" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialServiceValueSar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (SAR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter value"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PO Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">PO Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prConvertedToPo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>PR Converted to PO</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poDelivered"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>PO Delivered</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <FormField
                   control={form.control}
                   name="poNumber"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>
                         PO Number
                         {form.watch('prConvertedToPo') && <span className="text-red-500 ml-1">*</span>}
                       </FormLabel>
                       <FormControl>
                         <Input 
                           placeholder="Enter PO number" 
                           {...field} 
                           className={form.watch('prConvertedToPo') ? 'border-red-200 focus:border-red-500' : ''}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="poLineItem"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>
                         PO Line Item
                         {form.watch('prConvertedToPo') && <span className="text-red-500 ml-1">*</span>}
                       </FormLabel>
                       <FormControl>
                         <Input 
                           placeholder="Enter PO line item" 
                           {...field} 
                           className={form.watch('prConvertedToPo') ? 'border-red-200 focus:border-red-500' : ''}
                         />
                       </FormControl>
                       <FormMessage />
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
