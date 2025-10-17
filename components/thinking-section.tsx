"use client"

import { ChevronDown, ChevronUp, Brain } from "lucide-react"
import { useState } from "react"

interface ThinkingSectionProps {
  thinking: string
}

/**
 * Collapsible section that displays AI's reasoning process
 * 
 * This component shows the AI's thinking steps in a collapsible container.
 * By default, the section is collapsed to keep the UI clean.
 * Users can click to expand and see the detailed reasoning.
 * 
 * @param thinking - The thinking content to display (multi-line text)
 * 
 * @example
 * ```tsx
 * <ThinkingSection thinking="1. First step\n2. Second step\n3. Final step" />
 * ```
 */
export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="mb-3 border border-blue-100 rounded-lg overflow-hidden bg-blue-50/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors"
        aria-expanded={isExpanded}
        aria-label="Mostra o nascondi ragionamento dell'intelligenza artificiale"
      >
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Brain className="w-4 h-4" />
          <span className="font-medium">Ragionamento</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-3 py-2 border-t border-blue-100 bg-white">
          <div className="text-sm text-gray-700 space-y-1 font-light">
            {thinking.split('\n').map((line, i) => (
              <p key={i} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

