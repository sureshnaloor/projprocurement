'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PrefixInputProps {
  value: string
  onChange: (value: string) => void
  prefix: string
  className?: string
  disabled?: boolean
}

export function PrefixInput({
  value,
  onChange,
  prefix,
  className,
  disabled = false
}: PrefixInputProps) {
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ensure the value always starts with the prefix
  const ensurePrefix = (inputValue: string) => {
    if (!inputValue.startsWith(prefix)) {
      return prefix
    }
    return inputValue
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow numbers and dots
    const filteredInput = inputValue.replace(/[^0-9.]/g, '')
    
    const finalValue = prefix + filteredInput
    onChange(finalValue)
  }

  // Handle focus to ensure cursor is positioned correctly
  const handleFocus = () => {
    if (inputRef.current) {
      const currentValue = inputRef.current.value
      if (currentValue.length <= prefix.length) {
        inputRef.current.setSelectionRange(prefix.length, prefix.length)
      }
    }
  }

  // Handle keydown to prevent cursor from going before prefix
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const cursorPos = e.currentTarget.selectionStart || 0
    
    // Prevent backspace and delete if cursor is at or before prefix
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= prefix.length) {
      e.preventDefault()
    }
    
    // Prevent arrow keys from going before prefix
    if ((e.key === 'ArrowLeft' || e.key === 'Home') && cursorPos <= prefix.length) {
      e.preventDefault()
      if (inputRef.current) {
        inputRef.current.setSelectionRange(prefix.length, prefix.length)
      }
    }
  }

  // Handle click to prevent cursor from going before prefix
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const cursorPos = e.currentTarget.selectionStart || 0
    if (cursorPos < prefix.length) {
      e.preventDefault()
      if (inputRef.current) {
        inputRef.current.setSelectionRange(prefix.length, prefix.length)
      }
    }
  }

  // Set cursor position after render
  useEffect(() => {
    if (inputRef.current && cursorPosition > 0) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [cursorPosition, value])

  // Ensure value has prefix on mount
  useEffect(() => {
    if (value && !value.startsWith(prefix)) {
      onChange(prefix)
    }
  }, [prefix, value, onChange])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value.substring(prefix.length)} // Only show the part after prefix
        onChange={handleChange}
        className={cn(
          "pl-0",
          className
        )}
        disabled={disabled}
        style={{
          paddingLeft: `${prefix.length * 8 + 12}px` // Adjust padding based on prefix length
        }}
      />
             {/* Visual prefix indicator */}
       <div 
         className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground select-none"
         style={{
           fontFamily: 'inherit',
           fontSize: 'inherit',
           lineHeight: 'inherit',
           userSelect: 'none',
           color: '#6b7280', // Ensure consistent muted color
           paddingRight: '8px' // Add padding to the right of prefix
         }}
       >
         {prefix}
       </div>
    </div>
  )
}
