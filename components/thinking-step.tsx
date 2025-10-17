"use client"

import { useEffect, useState } from "react"

interface ThinkingStepProps {
  content: string
  index: number
  isNew?: boolean
}

/**
 * Individual thinking step component with fade-in animation
 * NO ICON - just clean text display in a light blue box
 */
export function ThinkingStep({ content, index, isNew = false }: ThinkingStepProps) {
  const [show, setShow] = useState(!isNew)
  
  // Fade in animation for new steps
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShow(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isNew])
  
  return (
    <div 
      className={`
        px-3 py-2 rounded-lg
        bg-blue-50/70 border border-blue-100
        transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <span className="text-xs text-blue-700 font-light leading-relaxed">
        {content}
      </span>
    </div>
  )
}

