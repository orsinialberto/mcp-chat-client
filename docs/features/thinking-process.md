# Thinking Process Feature - Specification

## Overview

This feature enhances the MCP Chat Client (Archimede) to display the AI's reasoning process in a transparent, user-friendly way, similar to ChatGPT's thinking mode. It also improves error handling by hiding technical error messages while maintaining detailed logging for developers.

## Problem Statement

### Current Issues

1. **Lack of Transparency**: Users don't see how the AI arrives at its conclusions
   - When MCP searches fail or return no results, users are unaware
   - Multiple retry attempts are invisible to the user
   - The decision-making process is a "black box"

2. **Poor Error Experience**: Technical errors are displayed directly to users
   - Error messages with stack traces appear in the chat
   - Red error messages create anxiety and confusion
   - Users can't distinguish between recoverable and critical errors
   - Technical jargon is not user-friendly

3. **No Search Strategy Visibility**: Users don't understand the MCP search process
   - AI tries multiple approaches but users don't see this effort
   - Failed searches appear as simple failures
   - No indication of alternative search strategies being attempted

## Proposed Solution

### 1. AI Thinking Process Visualization

Display the AI's reasoning steps in a dedicated, collapsible section above each response.

**Key Features**:
- Transparent reasoning process shown to users
- Collapsible "Ragionamento" (Reasoning) section
- Numbered steps explaining the AI's approach
- Visibility into MCP tool usage and search strategies
- Explanation of retry logic when searches fail

**Benefits**:
- Users understand how the AI works
- Trust increases through transparency
- Educational value: users learn about segmentation strategies
- Better debugging when results are unexpected

### 2. Improved Error Handling

Hide technical errors from the user interface while maintaining comprehensive logging for developers.

**Key Features**:
- No more red error messages in chat
- Technical errors logged to browser console
- Server errors logged via MCPLogger
- AI handles retry logic gracefully
- User-friendly generic messages when appropriate

**Benefits**:
- Professional, polished user experience
- Less user anxiety and confusion
- Developers still have full debugging information
- Cleaner chat history

### 3. Retry Strategy Display

Show users when the AI is trying alternative approaches to find information.

**Key Features**:
- Thinking section explains each search attempt
- Clear indication when first search doesn't yield results
- Explanation of why alternative parameters are being tried
- Transparency about what was found at each step

**Benefits**:
- Users understand the AI is working hard to help them
- Reduces perception of "no results" as a failure
- Educational: shows different ways to search for information

## User Experience

### Before (Current State)

**Scenario**: User asks about tenants in Marketing Cloud

```
User: Mostrami i tenant disponibili

AI: **Errore:** Failed to fetch
Riprova più tardi.
```

**Problems**:
- User sees a technical error message
- No explanation of what went wrong
- No indication that alternative approaches were tried
- Red error styling creates negative experience
- User doesn't know if the problem is temporary or permanent

### After (With Thinking Process)

**Scenario**: Same query with new feature

```
User: Mostrami i tenant disponibili

AI:
┌─────────────────────────────────┐
│ 🧠 Ragionamento          [v]    │  <- Collapsible section (collapsed by default)
└─────────────────────────────────┘

[AI's main response with tenant data]
```

**When expanded**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Ragionamento                                      [^]    │
├─────────────────────────────────────────────────────────────┤
│ 1. L'utente chiede la lista dei tenant disponibili         │
│ 2. Cercherò i tenant usando lo strumento get_tenants       │
│ 3. La prima ricerca ha restituito 5 tenant attivi          │
│ 4. Formatterò i risultati in una tabella leggibile         │
└─────────────────────────────────────────────────────────────┘

[AI's formatted response with tenant table]
```

**With retry scenario**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Ragionamento                                      [^]    │
├─────────────────────────────────────────────────────────────┤
│ 1. L'utente chiede informazioni sul tenant "Acme Corp"     │
│ 2. Cerco con get_tenant_by_name("Acme Corp")               │
│ 3. Nessun risultato trovato con il nome esatto             │
│ 4. Riprovo con una ricerca parziale "Acme"                 │
│ 5. Trovati 2 tenant che contengono "Acme"                  │
│ 6. Ora posso fornire i risultati all'utente                │
└─────────────────────────────────────────────────────────────┘

Ecco i tenant che corrispondono alla tua ricerca:

| Tenant ID | Nome | Label |
|-----------|------|-------|
| 710 | Acme Corporation | Acme Corp - 3000123 |
| 715 | Acme Industries | Acme Ind - 3000456 |
```

**Benefits**:
- User sees the AI's thought process
- Retry attempts are visible and explained
- No technical errors in the chat UI
- Educational: user learns about search strategies
- Increased trust and transparency

## UI Design

### Thinking Section Component

**Visual Design**:
- Light blue background (`bg-blue-50/50`)
- Blue border (`border-blue-100`)
- Brain icon (🧠) from lucide-react
- "Ragionamento" label in Italian
- Chevron icon (▼/▲) indicating collapsed/expanded state
- Smooth expand/collapse animation

**Interaction**:
- Click anywhere on the header to toggle
- Keyboard accessible (Enter/Space to toggle)
- ARIA labels for screen readers
- Default state: collapsed
- Maintains state during chat session

**Content Styling**:
- Numbered list format (when AI provides numbered steps)
- Small font size (`text-sm`)
- Light font weight (`font-light`)
- Adequate line height for readability
- White background for content area

### Error Handling (Hidden)

**What Changes**:
- Remove red error message bubbles
- Remove `isError` flag from ChatMessage interface
- Remove error styling (red background, red icon)
- Remove error messages from chat history storage

**What Stays**:
- Console logging for developers (`console.error`)
- Logger calls for server-side errors (`MCPLogger.error`)
- Network error monitoring
- Debugging capabilities unchanged

## Technical Approach

### Implementation Strategy

1. **Prompt-Based Reasoning** (chosen approach)
   - Modify system prompt to instruct AI to include thinking sections
   - Use specific markers: `---THINKING-START---` and `---THINKING-END---`
   - AI generates reasoning as part of its response text
   - Parser extracts thinking from response content

2. **Why this approach**:
   - Model-agnostic (works with any provider)
   - No dependency on specific model features
   - Full control over thinking format
   - Easy to implement and maintain
   - Works with existing streaming infrastructure

### Data Flow

```
User Input
    ↓
API Route (/api/chat)
    ↓
AI Provider (with updated system prompt)
    ↓
AI generates response with thinking markers
    ↓
Stream to frontend
    ↓
MessageContent component receives full response
    ↓
thinking-parser.ts extracts thinking section
    ↓
Render ThinkingSection (if present) + answer
```

## Success Criteria

### Functional Requirements

- [x] AI responses include thinking sections when appropriate
- [x] Thinking section is collapsible/expandable
- [x] Thinking displays before the main answer
- [x] Technical errors hidden from chat UI
- [x] Errors still logged to console
- [x] Charts and other features continue to work
- [x] Mobile responsive design maintained

### User Experience Requirements

- [x] Thinking section is visually distinct but not intrusive
- [x] Default collapsed state doesn't overwhelm the UI
- [x] Expanded state is easily readable
- [x] Keyboard navigation works properly
- [x] Screen reader accessible
- [x] Italian language maintained throughout
- [x] Loading states remain unchanged

### Performance Requirements

- [x] No impact on message rendering speed
- [x] Smooth expand/collapse animations
- [x] No additional network requests
- [x] Parser executes in < 10ms for typical messages

## Future Enhancements

### Potential Improvements

1. **Progressive Thinking Display**
   - Show thinking steps as they're generated (streaming)
   - Animate thinking steps appearing one by one
   - Real-time indication of AI's current step

2. **Thinking Preferences**
   - User setting to show/hide thinking by default
   - Per-message toggle in chat history
   - Export thinking with conversation

3. **Enhanced Visualization**
   - Color-coded steps (planning, searching, analyzing, responding)
   - Icons for different types of operations
   - Timeline view for complex reasoning chains

4. **Analytics**
   - Track which thinking sections users expand
   - Identify patterns in retry scenarios
   - Optimize prompt based on user engagement

## Implementation Timeline

- **Phase 1**: Documentation and planning (2 hours)
- **Phase 2**: Core utilities (thinking-parser.ts) (1 hour)
- **Phase 3**: UI components (thinking-section.tsx) (1 hour)
- **Phase 4**: Backend modifications (system prompt) (30 minutes)
- **Phase 5**: Frontend integration (message-content.tsx, page.tsx) (2 hours)
- **Phase 6**: Testing (unit + manual) (2 hours)
- **Phase 7**: Code review and refinement (1 hour)

**Total Estimated Time**: 9.5 hours

## References

- AGENTS.md - Development guidelines and standards
- docs/architecture.md - System architecture overview
- docs/features/project_features.md - Existing feature documentation
- AI SDK Documentation - Streaming and chat functionality
- Radix UI - Accessible component patterns

---

*Feature Specification v1.0 - Created 2025-10-16*
