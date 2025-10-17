import { parseThinkingContent, ParsedMessage } from '@/lib/thinking-parser'

describe('parseThinkingContent', () => {
  describe('valid thinking sections', () => {
    it('should parse message with thinking section', () => {
      const content = `---THINKING-START---
1. First step
2. Second step
---THINKING-END---

This is the answer.`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toBe('1. First step\n2. Second step')
      expect(result.answer).toBe('This is the answer.')
    })

    it('should handle multiline thinking and answer', () => {
      const content = `---THINKING-START---
Step 1: Do something
Step 2: Do another thing
Step 3: Final step
---THINKING-END---

Answer line 1
Answer line 2
Answer line 3`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toContain('Step 1')
      expect(result.thinking).toContain('Step 3')
      expect(result.answer).toContain('Answer line 1')
      expect(result.answer).toContain('Answer line 3')
    })

    it('should trim whitespace from thinking and answer', () => {
      const content = `---THINKING-START---
  
  Thinking with spaces  
  
---THINKING-END---
  
  Answer with spaces  
  `

      const result = parseThinkingContent(content)

      expect(result.thinking).toBe('Thinking with spaces')
      expect(result.answer).toBe('Answer with spaces')
    })
  })

  describe('messages without thinking', () => {
    it('should return full content as answer when no markers present', () => {
      const content = 'This is a regular message without thinking.'

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinking).toBeNull()
      expect(result.answer).toBe(content)
    })

    it('should handle empty content', () => {
      const content = ''

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinking).toBeNull()
      expect(result.answer).toBe('')
    })
  })

  describe('malformed markers', () => {
    it('should handle only start marker', () => {
      const content = '---THINKING-START---\nThinking content but no end'

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinking).toBeNull()
      expect(result.answer).toBe(content)
    })

    it('should handle only end marker', () => {
      const content = 'Some content\n---THINKING-END---'

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinking).toBeNull()
      expect(result.answer).toBe(content)
    })

    it('should handle markers in wrong order', () => {
      const content = '---THINKING-END---\nContent\n---THINKING-START---'

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(false)
      expect(result.thinking).toBeNull()
      expect(result.answer).toBe(content)
    })

    it('should handle empty thinking section', () => {
      const content = `---THINKING-START---
---THINKING-END---
Answer content`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toBe('')
      expect(result.answer).toBe('Answer content')
    })

    it('should handle empty answer section', () => {
      const content = `---THINKING-START---
Thinking content
---THINKING-END---`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toBe('Thinking content')
      expect(result.answer).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle multiple occurrences of markers (use first pair)', () => {
      const content = `---THINKING-START---
First thinking
---THINKING-END---
First answer
---THINKING-START---
Second thinking
---THINKING-END---
Second answer`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toBe('First thinking')
      // Answer should include everything after first END marker
      expect(result.answer).toContain('First answer')
    })

    it('should handle markers with extra whitespace', () => {
      const content = `---THINKING-START---
   Thinking with spaces   
---THINKING-END---
   Answer with spaces   `

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toBe('Thinking with spaces')
      expect(result.answer).toBe('Answer with spaces')
    })

    it('should handle special characters in content', () => {
      const content = `---THINKING-START---
Special chars: <>&"'
---THINKING-END---
More special chars: €£¥`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toContain('<>&"\'')
      expect(result.answer).toContain('€£¥')
    })

    it('should handle Italian text with accents', () => {
      const content = `---THINKING-START---
1. L'utente chiede informazioni sui tenant
2. Cercherò usando lo strumento get_tenants
3. La ricerca ha restituito 5 risultati
---THINKING-END---

Ecco i tenant disponibili nel sistema.`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toContain("L'utente")
      expect(result.thinking).toContain('Cercherò')
      expect(result.answer).toContain('Ecco i tenant')
    })

    it('should handle markdown in thinking and answer', () => {
      const content = `---THINKING-START---
**Step 1**: Check the database
- Look for active users
- Filter by status
---THINKING-END---

Here's the result in **markdown**:
- Item 1
- Item 2`

      const result = parseThinkingContent(content)

      expect(result.hasThinking).toBe(true)
      expect(result.thinking).toContain('**Step 1**')
      expect(result.thinking).toContain('- Look for active users')
      expect(result.answer).toContain('**markdown**')
      expect(result.answer).toContain('- Item 1')
    })
  })
})

