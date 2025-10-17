"use client"

import { ThinkingStep } from "./thinking-step"
import { ThinkingStep as ThinkingStepType } from "@/lib/thinking-stream-parser"
import { Loader2 } from "lucide-react"

interface ThinkingStepsContainerProps {
  steps: ThinkingStepType[]
  isComplete: boolean
  isLoading?: boolean
}

/**
 * Container for all thinking steps
 * Shows thinking in progress or completed state
 * Header has icon, individual steps do NOT have icons
 */
export function ThinkingStepsContainer({ 
  steps, 
  isComplete, 
  isLoading = false 
}: ThinkingStepsContainerProps) {
  if (steps.length === 0) return null
  
  return (
    <div className="mb-4 space-y-2">
      {/* Header with status indicator - ICON ONLY HERE */}
      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-2">
        {!isComplete && isLoading && (
          <Loader2 className="w-3 h-3 animate-spin" />
        )}
        <span>
          {isComplete ? '🧠 Ragionamento' : '🧠 Ragionamento in corso...'}
        </span>
      </div>
      
      {/* Thinking steps - NO ICONS in individual steps */}
      <div className="space-y-1.5">
        {steps.map((step, index) => (
          <ThinkingStep 
            key={`${step.timestamp}-${index}`}
            content={step.content}
            index={index}
            isNew={index === steps.length - 1 && !isComplete}
          />
        ))}
      </div>
      
      {/* Divider when complete */}
      {isComplete && (
        <div className="border-t border-blue-100 pt-3 mt-3" />
      )}
    </div>
  )
}

