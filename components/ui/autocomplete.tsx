'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface AutocompleteOption {
  id: string
  value: string
  type?: 'project' | 'wbs'
  projectName?: string
  wbs?: string
}

interface AutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  type: 'project' | 'wbs'
  className?: string
  disabled?: boolean
  onSelectionChange?: (option: AutocompleteOption) => void
}

export function Autocomplete({
  value,
  onValueChange,
  placeholder,
  type,
  className,
  disabled = false,
  onSelectionChange
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const searchProjects = async (query: string) => {
    if (query.length < 3) {
      setOptions([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/projects/search?q=${encodeURIComponent(query)}&type=${type}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const result = await response.json()
      if (result.success) {
        setOptions(result.data || [])
      }
    } catch (error) {
      console.error('Error searching projects:', error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      searchProjects(searchQuery)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchQuery, type])

  const handleSelect = (option: AutocompleteOption) => {
    onValueChange(option.value)
    if (onSelectionChange) {
      onSelectionChange(option)
    }
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${type === 'project' ? 'project names' : 'WBS codes'}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </div>
              ) : searchQuery.length < 3 ? (
                "Type at least 3 characters to search"
              ) : (
                "No results found"
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.value}</span>
                    {type === 'project' && option.wbs && (
                      <span className="text-xs text-muted-foreground">
                        WBS: {option.wbs}
                      </span>
                    )}
                    {type === 'wbs' && option.projectName && (
                      <span className="text-xs text-muted-foreground">
                        Project: {option.projectName}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
