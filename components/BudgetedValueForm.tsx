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
import { Autocomplete } from '@/components/ui/autocomplete'
import { PrefixInput } from '@/components/ui/prefix-input'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

// Validation schema
const budgetedValueSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectWbs: z.string().min(1, 'Project WBS is required'),
  materialServiceWbs: z.string().min(1, 'Material/Service WBS is required'),
  materialService: z.string().min(1, 'Material/Service is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  budgetedValue: z.number().min(0, 'Budgeted value must be positive'),
  remarks: z.string().optional(),
})

type BudgetedValueFormData = z.infer<typeof budgetedValueSchema>

interface BudgetedValueFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Partial<BudgetedValueFormData>
  isEditing?: boolean
  budgetedValueId?: string
}

export default function BudgetedValueForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
  budgetedValueId
}: BudgetedValueFormProps) {
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

  const form = useForm<BudgetedValueFormData>({
    resolver: zodResolver(budgetedValueSchema),
    defaultValues: {
      projectName: initialData?.projectName || '',
      projectWbs: initialData?.projectWbs || '',
      materialServiceWbs: initialData?.materialServiceWbs || '',
      materialService: initialData?.materialService || '',
      quantity: initialData?.quantity || 0,
      unitOfMeasure: initialData?.unitOfMeasure || '',
      budgetedValue: initialData?.budgetedValue || 0,
      remarks: initialData?.remarks || '',
    },
  })

  // Reset form when modal opens/closes (only for new entries, not editing)
  useEffect(() => {
    if (isOpen && !isEditing) {
      // Reset form to default values when opening for new entry
      form.reset({
        projectName: '',
        projectWbs: '',
        materialServiceWbs: '',
        materialService: '',
        quantity: 0,
        unitOfMeasure: '',
        budgetedValue: 0,
        remarks: '',
      })
    } else if (isOpen && isEditing && initialData) {
      // Set form data for editing
      form.reset(initialData)
    }
  }, [isOpen, form, isEditing, initialData])

  const onSubmit = async (data: BudgetedValueFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditing && budgetedValueId 
        ? `/api/budgeted-values/${budgetedValueId}`
        : '/api/budgeted-values'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save budgeted value')
      }

      toast({
        title: 'Success',
        description: `Budgeted value ${isEditing ? 'updated' : 'created'} successfully`,
      })

      form.reset()
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} budgeted value`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          </div>

          {/* Material/Service Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Material/Service Information</h3>
            
            <FormField
              control={form.control}
              name="materialService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material/Service</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material/service description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="budgetedValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budgeted Value (SAR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter budgeted value"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
            {isEditing ? 'Update' : 'Create'} Budgeted Value
          </Button>
        </div>
      </form>
    </Form>
  )
}
