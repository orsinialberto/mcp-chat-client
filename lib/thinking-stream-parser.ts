/**
 * Real-time parser for streaming AI thinking process
 * Separates thinking steps from final answer as content streams in
 */

export interface ThinkingStep {
  content: string
  timestamp?: number
}

export interface StreamedContent {
  thinkingSteps: ThinkingStep[]
  answerContent: string
  hasThinking: boolean
  isThinkingComplete: boolean
}

const THINK_PREFIX = '💭 THINK: '

/**
 * Parses streaming content to extract thinking steps and answer
 * This function is called on EVERY render as new chunks arrive
 * 
 * @param content - Current streamed content (updates in real-time)
 * @returns Parsed structure with thinking steps and answer
 * 
 * @example
 * // First chunk arrives
 * parseStreamingContent("💭 THINK: Analyzing...")
 * // Returns: { thinkingSteps: [{content: "Analyzing..."}], answerContent: "", ... }
 * 
 * // More chunks arrive
 * parseStreamingContent("💭 THINK: Analyzing...\n💭 THINK: Searching...\nAnswer")
 * // Returns: { thinkingSteps: [...]x2, answerContent: "Answer", ... }
 */
export function parseStreamingContent(content: string): StreamedContent {
  const lines = content.split('\n')
  const thinkingSteps: ThinkingStep[] = []
  const answerLines: string[] = []
  let inAnswerMode = false
  
  for (const line of lines) {
    if (line.startsWith(THINK_PREFIX)) {
      // Extract thinking step
      const thinkingContent = line.substring(THINK_PREFIX.length).trim()
      if (thinkingContent) {
        thinkingSteps.push({
          content: thinkingContent,
          timestamp: Date.now()
        })
      }
    } else {
      // Once we hit a non-thinking line, we're in answer mode
      if (line.trim()) {
        inAnswerMode = true
      }
      answerLines.push(line)
    }
  }
  
  const answerContent = answerLines.join('\n').trim()
  
  return {
    thinkingSteps,
    answerContent,
    hasThinking: thinkingSteps.length > 0,
    isThinkingComplete: inAnswerMode || answerContent.length > 0
  }
}

