import { parseStreamingContent, StreamedContent } from '@/lib/thinking-stream-parser'

describe('parseStreamingContent', () => {
  describe('valid thinking sections', () => {
    it('should parse message with thinking steps', () => {
      const content = `💭 THINK: First step
💭 THINK: Second step

This is the answer.`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinkingSteps.length).toBe(2)
      expect(result.thinkingSteps[0].content).toBe('First step')
      expect(result.thinkingSteps[1].content).toBe('Second step')
      expect(result.answerContent).toBe('This is the answer.')
      expect(result.isThinkingComplete).toBe(true)
    })

    it('should handle multiple thinking steps and multiline answer', () => {
      const content = `💭 THINK: Step 1 analyzing
💭 THINK: Step 2 searching
💭 THINK: Step 3 found results

Answer line 1
Answer line 2
Answer line 3`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinkingSteps.length).toBe(3)
      expect(result.thinkingSteps[0].content).toContain('Step 1')
      expect(result.thinkingSteps[2].content).toContain('Step 3')
      expect(result.answerContent).toContain('Answer line 1')
      expect(result.answerContent).toContain('Answer line 3')
    })

    it('should trim whitespace from thinking content', () => {
      const content = `💭 THINK:   Thinking with spaces   
💭 THINK: Another thought  

  Answer with spaces  
  `

      const result = parseStreamingContent(content)

      expect(result.thinkingSteps[0].content).toBe('Thinking with spaces')
      expect(result.thinkingSteps[1].content).toBe('Another thought')
      expect(result.answerContent).toContain('Answer with spaces')
    })

    it('should handle progressive streaming (thinking only, no answer yet)', () => {
      const content = `💭 THINK: Analyzing request
💭 THINK: Searching for data`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinkingSteps.length).toBe(2)
      expect(result.answerContent).toBe('')
      expect(result.isThinkingComplete).toBe(false)
    })
  })

  describe('messages without thinking', () => {
    it('should return full content as answer when no prefix present', () => {
      const content = 'This is a regular message without thinking.'

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinkingSteps.length).toBe(0)
      expect(result.answerContent).toBe(content)
    })

    it('should handle empty content', () => {
      const content = ''

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinkingSteps.length).toBe(0)
      expect(result.answerContent).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle empty thinking steps (prefix with no content)', () => {
      const content = `💭 THINK: 
💭 THINK: Valid step
Answer content`

      const result = parseStreamingContent(content)

      // Empty thinking steps should be filtered out
      expect(result.thinkingSteps.length).toBe(1)
      expect(result.thinkingSteps[0].content).toBe('Valid step')
      expect(result.answerContent).toContain('Answer content')
    })

    it('should handle answer only (no thinking)', () => {
      const content = `This is just an answer
with multiple lines
and no thinking.`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.answerContent).toBe(content)
      expect(result.isThinkingComplete).toBe(true)
    })

    it('should handle mixed content with empty lines', () => {
      const content = `💭 THINK: First thought

💭 THINK: Second thought

Answer paragraph 1

Answer paragraph 2`

      const result = parseStreamingContent(content)

      expect(result.thinkingSteps.length).toBe(2)
      expect(result.answerContent).toContain('Answer paragraph 1')
      expect(result.answerContent).toContain('Answer paragraph 2')
    })

    it('should handle partial prefix (edge case)', () => {
      const content = `💭 THINK: Valid thinking
THINK: Not valid (missing emoji)
Answer content`

      const result = parseStreamingContent(content)

      expect(result.thinkingSteps.length).toBe(1)
      expect(result.thinkingSteps[0].content).toBe('Valid thinking')
      // "THINK: Not valid" should be part of answer
      expect(result.answerContent).toContain('THINK: Not valid')
    })
  })

  describe('real-time streaming simulation', () => {
    it('should handle progressive chunk arrival', () => {
      // Simulate chunks arriving over time
      const chunk1 = `💭 THINK: Analyzing`
      const chunk2 = `💭 THINK: Analyzing
💭 THINK: Searching`
      const chunk3 = `💭 THINK: Analyzing
💭 THINK: Searching
💭 THINK: Found results
Here is`

      const result1 = parseStreamingContent(chunk1)
      expect(result1.thinkingSteps.length).toBe(1)
      expect(result1.isThinkingComplete).toBe(false)

      const result2 = parseStreamingContent(chunk2)
      expect(result2.thinkingSteps.length).toBe(2)
      expect(result2.isThinkingComplete).toBe(false)

      const result3 = parseStreamingContent(chunk3)
      expect(result3.thinkingSteps.length).toBe(3)
      expect(result3.isThinkingComplete).toBe(true)
      expect(result3.answerContent).toContain('Here is')
    })

    it('should handle special characters in content', () => {
      const content = `💭 THINK: Special chars: <>&"'
💭 THINK: More chars: €£¥
Answer content`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinkingSteps[0].content).toContain('<>&"\'')
      expect(result.thinkingSteps[1].content).toContain('€£¥')
    })

    it('should include timestamps in thinking steps', () => {
      const content = `💭 THINK: First
💭 THINK: Second`

      const result = parseStreamingContent(content)

      expect(result.thinkingSteps[0].timestamp).toBeDefined()
      expect(result.thinkingSteps[1].timestamp).toBeDefined()
      expect(typeof result.thinkingSteps[0].timestamp).toBe('number')
      expect(typeof result.thinkingSteps[1].timestamp).toBe('number')
    })
  })

  describe('performance and optimization', () => {
    it('should handle large content efficiently', () => {
      // Generate large content
      const thinkingLines = Array.from({ length: 100 }, (_, i) => 
        `💭 THINK: Step ${i + 1}`
      ).join('\n')
      const content = `${thinkingLines}\n\nLarge answer content`

      const startTime = Date.now()
      const result = parseStreamingContent(content)
      const endTime = Date.now()

      expect(result.thinkingSteps.length).toBe(100)
      expect(endTime - startTime).toBeLessThan(50) // Should parse in <50ms
    })

    it('should be deterministic (same input = same output)', () => {
      const content = `💭 THINK: First
💭 THINK: Second
Answer`

      const result1 = parseStreamingContent(content)
      const result2 = parseStreamingContent(content)

      expect(result1.thinkingSteps.length).toBe(result2.thinkingSteps.length)
      expect(result1.thinkingSteps[0].content).toBe(result2.thinkingSteps[0].content)
      expect(result1.answerContent).toBe(result2.answerContent)
    })
  })

  describe('Italian language content', () => {
    it('should handle Italian thinking steps', () => {
      const content = `💭 THINK: Analizzo la richiesta dell'utente
💭 THINK: Cerco i tenant nel sistema
💭 THINK: Ho trovato 5 tenant

Ecco i tenant disponibili:`

      const result = parseStreamingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinkingSteps.length).toBe(3)
      expect(result.thinkingSteps[0].content).toContain('Analizzo')
      expect(result.thinkingSteps[1].content).toContain('Cerco')
      expect(result.answerContent).toContain('Ecco i tenant')
    })
  })
})

