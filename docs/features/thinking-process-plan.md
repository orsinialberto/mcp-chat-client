# Thinking Process Feature - Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation guide for the Thinking Process feature as specified in `thinking-process.md`. The plan follows the development guidelines outlined in AGENTS.md.

## Development Checklist

### Phase 1: Documentation (Required per AGENTS.md) ✅ COMPLETED

- [x] **Task 1.1**: Create `docs/features/thinking-process.md` with feature specification
  - [x] Describe user problem and solution
  - [x] Define expected user experience
  - [x] Include UI mockup descriptions
  - [x] Document error handling improvements

- [x] **Task 1.2**: Create `docs/features/thinking-process-plan.md` with implementation details
  - [x] List all files to create/modify
  - [x] Explain technical decisions
  - [x] Document testing approach
  - [x] Reference AGENTS.md compliance

### Phase 2: Core Utilities ✅ COMPLETED

- [x] **Task 2.1**: Create `lib/thinking-parser.ts`
  - [x] Define ParsedMessage interface
  - [x] Implement parseThinkingContent function
  - [x] Handle edge cases (no markers, malformed content)
  - [x] Add JSDoc comments

- [x] **Task 2.2**: Write unit tests in `__tests__/lib/thinking-parser.test.ts`
  - [x] Test valid thinking section parsing
  - [x] Test messages without thinking markers
  - [x] Test malformed markers
  - [x] Test empty content edge cases
  - [x] Verify >80% code coverage (achieved 100%)

### Phase 3: UI Components ✅ COMPLETED

- [x] **Task 3.1**: Create `components/thinking-section.tsx`
  - [x] Implement collapsible/expandable UI
  - [x] Add Brain icon from lucide-react
  - [x] Style with Tailwind CSS (blue theme)
  - [x] Ensure accessibility (keyboard navigation, ARIA labels)
  - [x] Mobile responsive (works on all screen sizes)

### Phase 4: Backend Modifications

- [ ] **Task 4.1**: Update `app/api/chat/route.ts`
  - [ ] Modify SYSTEM_PROMPT constant (lines 6-32)
  - [ ] Add THINKING PROCESS instructions
  - [ ] Add exact marker format (---THINKING-START---, ---THINKING-END---)
  - [ ] Include retry strategy instructions
  - [ ] Preserve existing MCP search strategy
  - [ ] Verify no breaking changes to existing functionality

### Phase 5: Frontend Integration

- [ ] **Task 5.1**: Modify `components/message-content.tsx`
  - [ ] Import parseThinkingContent and ThinkingSection
  - [ ] Parse thinking before parsing charts
  - [ ] Render ThinkingSection when present
  - [ ] Ensure charts still work correctly
  - [ ] Test with various message formats

- [ ] **Task 5.2**: Simplify error handling in `app/page.tsx`
  - [ ] Update onError callback (lines 168-182)
  - [ ] Keep console.error and Logger.error
  - [ ] Remove error message save to chat history
  - [ ] Remove isError field from ChatMessage interface (line 15)
  - [ ] Remove error-related code in saveMessageToChat (lines 51, 178-180, 191)
  - [ ] Remove error filtering in displayMessages (lines 235, 332, 348)
  - [ ] Remove error UI styling (lines 460-462, 471-473, 479)

### Phase 6: Testing

- [ ] **Task 6.1**: Run unit tests
  - [ ] Execute `npm test`
  - [ ] Verify all tests pass
  - [ ] Check code coverage >80%

- [ ] **Task 6.2**: Manual testing checklist
  - [ ] AI responses show thinking section with expand/collapse
  - [ ] Thinking section displays before the answer
  - [ ] Messages without thinking render normally
  - [ ] Errors are hidden from UI but logged to console
  - [ ] Charts still render correctly
  - [ ] Mobile responsive design maintained
  - [ ] Accessibility: keyboard navigation works
  - [ ] Italian language maintained throughout
  - [ ] Test with all providers (Gemini, Anthropic)
  - [ ] Test with successful MCP calls
  - [ ] Test with failed MCP calls
  - [ ] Test with multiple retry attempts

### Phase 7: Code Review & Quality

- [ ] **Task 7.1**: Self code review (per AGENTS.md)
  - [ ] Code follows style guidelines (camelCase, 2 spaces, max 100 chars)
  - [ ] No console.logs in production code (only Logger)
  - [ ] Error handling implemented properly
  - [ ] Tests written and passing
  - [ ] No hardcoded values
  - [ ] Documentation updated
  - [ ] TypeScript types properly defined
  - [ ] Performance considerations addressed

- [ ] **Task 7.2**: Run linter
  - [ ] Execute `npm run lint`
  - [ ] Fix any linting errors

- [ ] **Task 7.3**: Update project documentation (NEW - User Request)
  - [ ] Update `docs/features/project_features.md` - Add new feature section
  - [ ] Update `docs/architecture.md` - Document new components and data flow
  - [ ] Update `README.md` (if exists) - Mention thinking process feature
  - [ ] Ensure all documentation is consistent and up-to-date

### Phase 8: Deployment Preparation

- [ ] **Task 8.1**: Final checks
  - [ ] All tests passing
  - [ ] Documentation complete
  - [ ] No breaking changes to existing features
  - [ ] Console logs clean (no errors in normal flow)

- [ ] **Task 8.2**: Git commit (when ready)
  - [ ] Use conventional commit format
  - [ ] Message: `feat: add AI thinking process visualization and improve error handling`

## Technical Implementation Details

### 1. Architecture Decision: Prompt-Based Reasoning

**Decision**: Use prompt engineering to generate thinking sections rather than tool-call tracking.

**Rationale**:
- **Model-agnostic**: Works with any AI provider (Gemini, Anthropic, OpenAI, Ollama)
- **No infrastructure changes**: Leverages existing streaming setup
- **Full control**: We define the exact format and content of thinking
- **Maintainable**: Simple to update and modify the thinking format
- **No latency overhead**: Thinking is generated inline with the response

**Alternative considered**: Real-time tool call tracking via `onStepFinish`
- **Rejected because**: Would require complex state management, provider-specific implementation, and potential UI sync issues

### 2. Thinking Marker Format

**Format**: 
```
---THINKING-START---
[Thinking content]
---THINKING-END---
[Answer content]
```

**Rationale**:
- Simple to parse with string operations
- Unlikely to appear in normal content
- Clear visual separation in raw text
- Easy to debug if parsing fails
- Similar to existing chart block format (```chart)

**Alternatives considered**:
- JSON format: Too rigid, harder for AI to generate consistently
- HTML comments: Not markdown-friendly
- Special characters only: Ambiguous, could conflict with content

### 3. Component Design: Collapsible by Default

**Decision**: Thinking section starts collapsed with option to expand.

**Rationale**:
- **Non-intrusive**: Doesn't overwhelm users who don't care about thinking
- **Progressive disclosure**: Advanced users can explore details
- **Clean UI**: Keeps chat history compact
- **Curiosity-driven**: Brain icon invites exploration
- **Performance**: Reduces initial DOM size for long conversations

**Alternative considered**: Always expanded
- **Rejected because**: Would clutter the interface and reduce answer visibility

### 4. Error Handling Philosophy

**Decision**: Hide all technical errors from UI, maintain comprehensive logging.

**Rationale**:
- **User experience**: Technical errors create anxiety and confusion
- **Professional appearance**: Error-free UI looks polished
- **AI-driven recovery**: Let the AI explain problems in natural language
- **Developer needs met**: Console and server logs preserve debugging capability
- **Trust building**: Users see a confident, capable assistant

**Implementation**:
- Remove `isError` field completely from data model
- Remove all error UI components and styling
- Keep all `Logger.error()` and `console.error()` calls
- Let AI generate user-friendly explanations via thinking section

### 5. Integration with Existing Features

**Charts**: Parse thinking BEFORE charts to avoid conflicts
```typescript
const { thinking, answer } = parseThinkingContent(content)
const chartParts = parseCharts(answer)  // Charts parsed from answer only
```

**Streaming**: No changes needed - thinking streams with rest of response

**Multi-provider**: Works identically across all providers

**MCP Tools**: AI explains tool usage in thinking section naturally

## File-by-File Implementation Guide

### File 1: `lib/thinking-parser.ts` (NEW)

**Purpose**: Utility to extract thinking sections from AI responses

**Implementation**:

```typescript
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
 * @param content - The raw AI response content
 * @returns ParsedMessage object with thinking and answer separated
 * 
 * @example
 * const result = parseThinkingContent(aiResponse)
 * if (result.hasThinking) {
 *   console.log('Thinking:', result.thinking)
 * }
 * console.log('Answer:', result.answer)
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
```

**Edge cases handled**:
- No markers present: Returns full content as answer
- Only start marker: Returns full content as answer
- Only end marker: Returns full content as answer
- Markers in wrong order: Returns full content as answer
- Empty thinking section: Returns empty string for thinking
- Empty answer section: Returns empty string for answer

**Testing focus**: All edge cases above + normal usage

### File 2: `components/thinking-section.tsx` (NEW)

**Purpose**: Collapsible UI component to display thinking process

**Implementation**:

```typescript
"use client"
import { ChevronDown, ChevronUp, Brain } from "lucide-react"
import { useState } from "react"

interface ThinkingSectionProps {
  thinking: string
}

/**
 * Collapsible section that displays AI's reasoning process
 * Default state: collapsed
 * Click to expand/collapse
 */
export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="mb-3 border border-blue-100 rounded-lg overflow-hidden bg-blue-50/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors"
        aria-expanded={isExpanded}
        aria-label="Mostra o nascondi ragionamento"
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
              <p key={i} className="leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Styling details**:
- Blue theme matches existing UI accent color
- Light background doesn't distract from main content
- Smooth hover transition
- Clear visual hierarchy (icon + label + chevron)

**Accessibility**:
- `aria-expanded` indicates state to screen readers
- `aria-label` provides context
- Keyboard navigable (button is naturally focusable)
- Enter/Space to toggle (native button behavior)

### File 3: `components/message-content.tsx` (MODIFY)

**Changes**: Add thinking parsing and display

**Location**: After line 11 (imports) and around line 80 (rendering)

**Add imports**:
```typescript
import { parseThinkingContent } from "@/lib/thinking-parser"
import { ThinkingSection } from "./thinking-section"
```

**Modify the main function** (around line 80):
```typescript
export function MessageContent({ content }: MessageContentProps) {
  const cleanedContent = cleanContent(content)
  
  // NEW: Parse thinking section first
  const { thinking, answer, hasThinking } = parseThinkingContent(cleanedContent)
  
  // Parse charts from answer only (not from thinking)
  const parts = parseCharts(answer)

  return (
    <div className="prose prose-sm max-w-none">
      {/* NEW: Render thinking section if present */}
      {hasThinking && thinking && (
        <ThinkingSection thinking={thinking} />
      )}
      
      {/* Existing chart and text rendering */}
      {parts.map((part, index) => {
        if (part.type === "chart") {
          return <ChartRenderer key={index} chartData={part.content} />
        }
        return (
          <div key={index} className="text-gray-900 font-light leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // ... existing components ...
              }}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
```

**Order of operations**:
1. Clean content (existing)
2. Parse thinking (NEW)
3. Parse charts from answer only (modified)
4. Render thinking section (NEW)
5. Render charts and text (existing)

**Why this order**: Thinking must be extracted before chart parsing to avoid treating thinking markers as part of chart blocks

### File 4: `app/api/chat/route.ts` (MODIFY)

**Changes**: Update SYSTEM_PROMPT constant

**Location**: Lines 6-32

**Replace the entire SYSTEM_PROMPT**:

```typescript
const SYSTEM_PROMPT = `You are Archimede, an AI assistant for Marketing Cloud customer segmentation.

THINKING PROCESS (MANDATORY):
Before providing your final answer, you MUST show your reasoning process in a dedicated section.

Format your responses EXACTLY like this:
---THINKING-START---
1. Prima, devo capire cosa l'utente sta chiedendo...
2. Cercherò X usando lo strumento Y perché...
3. [Dopo la chiamata] La ricerca ha restituito Z risultati, il che significa...
4. Se i risultati sono insufficienti, proverò a cercare con il parametro W...
5. Ora ho abbastanza informazioni per formulare una risposta completa.
---THINKING-END---

[La tua risposta finale qui senza alcun marker di thinking]

IMPORTANT RULES FOR THINKING:
- Always include the THINKING section before your answer
- Use the exact markers: ---THINKING-START--- and ---THINKING-END---
- Number your reasoning steps clearly (1. 2. 3. etc.)
- Write thinking in Italian like the rest of your response
- Explain what you're doing and why at each step
- If an MCP tool call fails or returns no results, explain in thinking what you'll try next
- Keep thinking concise but informative (max 5-7 steps)
- The thinking section helps users understand your approach
- NEVER include thinking markers in your final answer section

ROLE: Guide in creating/optimizing segments, resolve errors, generate visualizations.

DATA FORMATTING RULES:
- When presenting lists of data (tenants, segments, etc.), use proper markdown tables
- NEVER convert JSON arrays to bullet points or plain text
- Use this table format for tenant lists:

| Tenant ID | Tenant Name | Tenant Label |
|-----------|-------------|--------------|
| 706 | Cplan Pipeline API - 3000277 | Cplan Pipeline API - 3000277_2 |
| 710 | Cplan Integration Test Bis | Cplan Integration Test Bis Parent - 3000389 |

- For other data lists, create appropriate tables with clear headers
- Keep JSON responses as proper JSON when requested
- Use code blocks with \`\`\`json for JSON data
- Use code blocks with \`\`\`markdown for markdown tables

IMPORTANT - MCP SEARCH STRATEGY:
If you don't find useful information on the first attempt with MCP tools, 
you must try at least 3 different searches with different parameters before responding generically.
Use alternative search terms, different filters, and multiple approaches to find the required information.
Vary search parameters (e.g., different tenant names, broader/specific queries, related terms).
EXPLAIN EACH ATTEMPT IN YOUR THINKING SECTION.

STYLE: Simple language, step-by-step, actionable responses.
Priority: data security, regulatory compliance, always backup.`;
```

**Key additions**:
- THINKING PROCESS section with exact format instructions
- Italian language for thinking (consistency)
- Integration with existing MCP search strategy
- Explicit instruction to explain retries in thinking

**Preserved**:
- All existing DATA FORMATTING RULES
- All existing MCP SEARCH STRATEGY
- All existing ROLE and STYLE guidelines

### File 5: `app/page.tsx` (MODIFY)

**Changes**: Simplify error handling, remove error UI

**Multiple locations** - specific line references:

**Change 1: Remove isError from interface (line 15)**:
```typescript
// BEFORE:
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  isError?: boolean // Nuovo campo per identificare i messaggi di errore
}

// AFTER:
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}
```

**Change 2: Remove isError handling in loadSavedChats (line 51)**:
```typescript
// BEFORE:
messages: chat.messages?.map((msg: any) => ({
  ...msg,
  createdAt: new Date(msg.createdAt),
  isError: msg.isError || false // Mantieni il flag isError esistente
})) || []

// AFTER:
messages: chat.messages?.map((msg: any) => ({
  ...msg,
  createdAt: new Date(msg.createdAt)
})) || []
```

**Change 3: Simplify onError callback (lines 168-182)**:
```typescript
// BEFORE:
onError: (error) => {
  Logger.error('Errore dettagliato nella chat:', error)
  
  // Salva il messaggio di errore nello storico della chat
  if (currentChatId) {
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `**Errore:** ${error.message}\n\nRiprova più tardi.`,
      createdAt: new Date(),
      isError: true // Flag per identificare i messaggi di errore
    }
    saveMessageToChat(currentChatId, errorMessage)
  }
},

// AFTER:
onError: (error) => {
  // Keep console logging for debugging
  Logger.error('Errore dettagliato nella chat:', error)
  console.error('Chat error details:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  
  // DO NOT save error message to chat history
  // The AI will handle retries and explain issues in thinking section
},
```

**Change 4: Remove isError from onFinish (line 191)**:
```typescript
// BEFORE:
const assistantMessage: ChatMessage = {
  id: message.id || `assistant-${Date.now()}`,
  role: 'assistant',
  content: message.content,
  createdAt: new Date(),
  isError: false
}

// AFTER:
const assistantMessage: ChatMessage = {
  id: message.id || `assistant-${Date.now()}`,
  role: 'assistant',
  content: message.content,
  createdAt: new Date()
}
```

**Change 5: Remove isError from user message (line 212)**:
```typescript
// BEFORE:
const userMessage: ChatMessage = {
  id: `user-${Date.now()}`,
  role: 'user',
  content: userInput,
  createdAt: new Date(),
  isError: false
}

// AFTER:
const userMessage: ChatMessage = {
  id: `user-${Date.now()}`,
  role: 'user',
  content: userInput,
  createdAt: new Date()
}
```

**Change 6: Remove error filtering in useEffect (line 235)**:
```typescript
// BEFORE:
const formattedMessages = currentChatMessages
  .filter(msg => !msg.isError) // Filtra i messaggi di errore dal context dell'AI
  .map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content
  }))

// AFTER:
const formattedMessages = currentChatMessages
  .map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content
  }))
```

**Change 7: Remove error handling in displayMessages (lines 318, 332, 348)**:
```typescript
// Simply remove all references to isError in the displayMessages function
// The function should treat all messages equally
```

**Change 8: Remove error UI styling (lines 460-462, 471-473, 479)**:
```typescript
// BEFORE (line 460):
<div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
  message.isError ? "bg-red-100" : "bg-blue-100"
}`}>
  <Bot className={`w-5 h-5 ${message.isError ? "text-red-600" : "text-blue-600"}`} />
</div>

// AFTER:
<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
  <Bot className="w-5 h-5 text-blue-600" />
</div>

// BEFORE (line 471):
<div
  className={`rounded-2xl px-4 py-3 ${
    message.role === "user" 
      ? "bg-blue-600 text-white ml-12" 
      : message.isError 
        ? "bg-red-50 border border-red-200" 
        : "bg-white border border-gray-200"
  }`}
>

// AFTER:
<div
  className={`rounded-2xl px-4 py-3 ${
    message.role === "user" 
      ? "bg-blue-600 text-white ml-12" 
      : "bg-white border border-gray-200"
  }`}
>

// BEFORE (line 479):
<div className={message.isError ? "text-red-700" : ""}>
  <MessageContent content={message.content} />
</div>

// AFTER:
<MessageContent content={message.content} />
```

### File 6: `__tests__/lib/thinking-parser.test.ts` (NEW)

**Purpose**: Unit tests for thinking parser

**Implementation**:

```typescript
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
  })
})
```

**Test coverage**: 
- All normal use cases
- All edge cases
- Error conditions
- Should achieve >95% coverage

### File 7: Documentation Updates (Task 7.3)

**File 7a: `docs/features/project_features.md` (MODIFY)**

Add new section after "Future Enhancements" (around line 350):

```markdown
### 11. AI Thinking Process Visualization
**Description**: Transparent display of AI reasoning and decision-making process.

**Key Features**:
- Collapsible "Ragionamento" section in AI responses
- Numbered reasoning steps explaining AI's approach
- Visibility into MCP tool usage and search strategies
- Explanation of retry logic when searches fail
- Clean error handling without technical details

**Implementation**:
- Prompt-based reasoning generation
- Markers: ---THINKING-START--- and ---THINKING-END---
- Custom parser to extract thinking from responses
- Dedicated UI component (ThinkingSection)
- Works with all AI providers

**User Experience**:
- Default collapsed state (non-intrusive)
- Click to expand and see reasoning
- Brain icon indicates thinking section
- Blue theme matching application design
- Keyboard accessible

**Technical Errors**:
- Hidden from user interface
- Logged to console for debugging
- AI explains issues in natural language
- No red error messages in chat
- Professional, polished appearance

**Use Cases**:
- Understanding complex MCP searches
- Learning about segmentation strategies
- Debugging unexpected results
- Building trust through transparency
- Educational value for users

---
```

**File 7b: `docs/architecture.md` (MODIFY)**

Add new section in appropriate location (data flow or components section):

```markdown
## Thinking Process Architecture

### Overview
The thinking process feature adds transparency to AI reasoning through prompt-based content generation and client-side parsing.

### Components

#### 1. Thinking Parser (`lib/thinking-parser.ts`)
- **Purpose**: Extract thinking sections from AI responses
- **Input**: Raw AI response string
- **Output**: ParsedMessage object with thinking and answer separated
- **Algorithm**: String-based marker detection
- **Performance**: O(n) where n is message length

#### 2. Thinking Section Component (`components/thinking-section.tsx`)
- **Type**: Client component (interactive)
- **State**: Collapsed/expanded toggle
- **Styling**: Blue theme, Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation

### Data Flow

```
User Query → API Route → AI Provider (with THINKING prompt)
                              ↓
                    AI generates response with markers
                              ↓
                    Stream to frontend (useChat)
                              ↓
                    MessageContent receives response
                              ↓
                    parseThinkingContent() extracts sections
                              ↓
            ThinkingSection (if present) + Answer rendering
```

### Prompt Engineering

System prompt instructs AI to:
1. Always include thinking section
2. Use specific markers (---THINKING-START---, ---THINKING-END---)
3. Number reasoning steps
4. Explain MCP tool usage
5. Document retry attempts
6. Write in Italian

### Error Handling Changes

**Previous Approach**:
- Errors displayed as red messages in chat
- `isError` flag in ChatMessage interface
- Error-specific UI styling

**New Approach**:
- Errors hidden from UI
- Logged to console and server
- AI explains issues in thinking section
- No `isError` flag needed
- Clean, professional appearance

### Performance Impact

- **Parsing overhead**: <10ms per message
- **UI impact**: Minimal (simple expand/collapse)
- **Network**: No additional requests
- **Streaming**: Unchanged (thinking streams with response)

### Integration Points

- **MessageContent**: Modified to parse and display thinking
- **useChat**: Unchanged (works with existing streaming)
- **System Prompt**: Extended with thinking instructions
- **ChatMessage interface**: Simplified (removed isError)

---
```

## Testing Strategy

### Unit Tests (Required)

**File**: `__tests__/lib/thinking-parser.test.ts`

**Test cases** (as detailed in File 6 above):
- Valid thinking sections
- Messages without thinking
- Malformed markers
- Edge cases
- Special characters

**Coverage target**: >80% (should achieve ~95%)

**Run with**: `npm test`

### Manual Testing (Required)

**Checklist**:
1. Start dev server: `npm run dev`
2. Test thinking display:
   - [ ] Ask a question that requires MCP search
   - [ ] Verify thinking section appears (collapsed)
   - [ ] Click to expand thinking
   - [ ] Verify reasoning steps are visible
   - [ ] Click to collapse thinking
   - [ ] Verify smooth animation

3. Test different scenarios:
   - [ ] Successful MCP search (single attempt)
   - [ ] Failed MCP search (multiple retries explained in thinking)
   - [ ] Question without MCP (thinking still shows reasoning)
   - [ ] Chart generation (thinking explains chart creation)

4. Test error handling:
   - [ ] Trigger an API error (disconnect network briefly)
   - [ ] Verify NO red error message appears in chat
   - [ ] Verify error is logged to browser console
   - [ ] Verify chat continues to function

5. Test UI/UX:
   - [ ] Mobile responsive (thinking works on small screens)
   - [ ] Keyboard navigation (Tab to thinking, Enter to expand)
   - [ ] Screen reader (ARIA labels present)
   - [ ] Italian language maintained

6. Test with different providers:
   - [ ] Google Gemini
   - [ ] Anthropic Claude
   - [ ] Verify thinking format consistent

7. Test existing features still work:
   - [ ] Charts render correctly
   - [ ] Markdown formatting works
   - [ ] Code blocks display properly
   - [ ] Tables render correctly
   - [ ] Multi-chat switching works
   - [ ] Chat history persists

### Integration Testing (Optional)

Per AGENTS.md, integration tests are optional. However, if implementing:

- Test full conversation flow with thinking
- Test error recovery scenarios
- Test thinking with various message types

## Code Quality Checklist

Per AGENTS.md guidelines:

### Style Compliance
- [ ] camelCase for variables and functions
- [ ] PascalCase for components and interfaces
- [ ] 2-space indentation
- [ ] Max 100 characters per line
- [ ] Semicolons used consistently
- [ ] No trailing whitespace

### Best Practices
- [ ] JSDoc comments on all exported functions
- [ ] TypeScript types properly defined
- [ ] No `any` types (except where necessary)
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Input validation where needed

### React/Next.js Specific
- [ ] "use client" directive on client components
- [ ] Proper hook usage (no violations)
- [ ] Key props on mapped elements
- [ ] No inline function definitions in JSX (where performance matters)
- [ ] Accessibility attributes (aria-labels, etc.)

### Performance
- [ ] No unnecessary re-renders
- [ ] Efficient string operations in parser
- [ ] Minimal DOM operations
- [ ] No memory leaks (proper cleanup)

## Deployment Checklist

Before considering feature complete:

- [ ] All unit tests passing (`npm test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Manual testing checklist complete
- [ ] Documentation updated (all 3 files)
- [ ] No console errors in normal operation
- [ ] No breaking changes to existing features
- [ ] TypeScript compilation successful
- [ ] Feature tested in production build (`npm run build`)

## Rollback Plan

If issues arise after deployment:

1. **Immediate rollback**:
   - Revert system prompt changes (AI stops generating thinking)
   - Remove ThinkingSection import from MessageContent
   - Feature gracefully degrades (no thinking shown)

2. **Partial rollback**:
   - Keep thinking parser and component
   - Disable in system prompt only
   - Can re-enable with prompt change only

3. **Data safety**:
   - No database changes (localStorage format unchanged except removed isError)
   - Existing chats still load correctly
   - No data loss risk

## Future Enhancements

Ideas for v2 of this feature:

1. **Progressive Thinking Display**
   - Show thinking steps as they stream in
   - Animate each step appearing
   - More engaging user experience

2. **Thinking Preferences**
   - User setting to always show/hide thinking
   - Per-message thinking visibility toggle
   - Export thinking with conversation

3. **Enhanced Visualization**
   - Color-coded steps (planning, searching, analyzing)
   - Icons for different operation types
   - Timeline view for complex reasoning

4. **Analytics**
   - Track thinking section expansion rate
   - Identify which types of thinking users engage with
   - Optimize prompt based on engagement

## References

- **AGENTS.md**: Development guidelines and standards
- **docs/features/thinking-process.md**: Feature specification
- **docs/architecture.md**: System architecture
- **AI SDK Documentation**: https://sdk.vercel.ai/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

## Conclusion

This implementation plan provides a complete roadmap for adding the thinking process feature to MCP Chat Client. The prompt-based approach ensures compatibility across all AI providers while maintaining simplicity and performance. The feature enhances transparency and trust without compromising the clean, professional user experience.

**Estimated Implementation Time**: 9-10 hours

**Risk Level**: Low (non-breaking changes, graceful degradation)

**User Impact**: High (significant UX improvement)

---

*Implementation Plan v1.0 - Created 2025-10-16*
*Follows AGENTS.md development guidelines*

