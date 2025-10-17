/**
 * Thinking Parser Utility
 * 
 * Parses AI responses to extract thinking sections from main answer content.
 * Used to display AI reasoning process separately from the final answer.
 */

/**
 * Interface representing a parsed message with thinking and answer sections
 */
export interface ParsedMessage {
  thinking: string | null
  answer: string
  hasThinking: boolean
}

/**
 * Parses AI response to extract thinking section and main answer
 * 
 * The function looks for specific markers (---THINKING-START--- and ---THINKING-END---)
 * to separate the AI's reasoning process from its final answer.
 * 
 * @param content - The raw AI response content
 * @returns ParsedMessage object with thinking and answer separated
 * 
 * @example
 * ```typescript
 * const result = parseThinkingContent(aiResponse)
 * if (result.hasThinking) {
 *   console.log('Thinking:', result.thinking)
 * }
 * console.log('Answer:', result.answer)
 * ```
 */
export function parseThinkingContent(content: string): ParsedMessage {
  const thinkingStartMarker = '---THINKING-START---'
  const thinkingEndMarker = '---THINKING-END---'
  
  const startIndex = content.indexOf(thinkingStartMarker)
  const endIndex = content.indexOf(thinkingEndMarker)
  
  // No thinking markers found or invalid order
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return {
      thinking: null,
      answer: content,
      hasThinking: false
    }
  }
  
  // Extract thinking content (between markers)
  const thinking = content
    .substring(startIndex + thinkingStartMarker.length, endIndex)
    .trim()
  
  // Extract answer content (after end marker)
  const answer = content
    .substring(endIndex + thinkingEndMarker.length)
    .trim()
  
  return {
    thinking,
    answer,
    hasThinking: true
  }
}

