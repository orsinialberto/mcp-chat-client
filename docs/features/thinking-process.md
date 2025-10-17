# Thinking Process Feature - Specification

## Overview

This feature enhances the MCP Chat Client (Archimede) to display the AI's reasoning process in **real-time** as it streams, providing transparent visibility into how the AI approaches each query. Unlike traditional post-completion displays, thinking steps appear **progressively** as the AI generates them, creating an engaging and educational experience. It also improves error handling by hiding technical error messages while maintaining detailed logging for developers.

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

### 1. Real-Time AI Thinking Process Visualization

Display the AI's reasoning steps **progressively as they're generated**, appearing before the final answer in real-time.

**Key Features**:
- **Real-time streaming**: Thinking steps appear as AI generates them
- **Progressive display**: Each step fades in sequentially
- **Visual separation**: Light blue boxes distinguish thinking from answers
- **Live status indicator**: Shows "Ragionamento in corso..." while thinking
- Visibility into MCP tool usage and search strategies
- Explanation of retry logic when searches fail

**Benefits**:
- Users see AI working in real-time (engaging experience)
- Trust increases through transparency
- Educational value: users learn about segmentation strategies step-by-step
- Better debugging when results are unexpected
- No waiting to understand what's happening

### 2. Improved Error Handling

Hide technical errors from the user interface while maintaining comprehensive logging for developers.

**Key Features**:
- No more red error messages in chat
- Technical errors logged to browser console
- Server errors logged via MCPLogger
- AI handles retry logic gracefully
- User-friendly explanations via thinking steps

**Benefits**:
- Professional, polished user experience
- Less user anxiety and confusion
- Developers still have full debugging information
- Cleaner chat history

### 3. Real-Time Retry Strategy Display

Show users **as it happens** when the AI is trying alternative approaches to find information.

**Key Features**:
- Thinking steps appear in real-time during search attempts
- Each retry attempt visible as a new thinking step
- Clear indication when first search doesn't yield results
- Explanation of why alternative parameters are being tried
- Live progress indicator shows AI is actively working

**Benefits**:
- Users see the AI is working hard to help them in real-time
- Reduces perception of "no results" as a failure
- Educational: shows different ways to search for information as they happen
- Engaging: creates sense of active problem-solving

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

### After (With Real-Time Thinking Process)

**Scenario**: Same query with new feature - thinking appears progressively

**Step 1** - First thinking step appears:
```
User: Mostrami i tenant disponibili

🧠 Ragionamento in corso... ⟳

┌──────────────────────────────────────────────────┐
│ Analizzo la richiesta dell'utente               │  <- Appears immediately
└──────────────────────────────────────────────────┘
```

**Step 2** - More thinking steps stream in:
```
🧠 Ragionamento in corso... ⟳

┌──────────────────────────────────────────────────┐
│ Analizzo la richiesta dell'utente               │
│ Uso get_tenants per cercare tutti i tenant      │  <- Fades in
└──────────────────────────────────────────────────┘
```

**Step 3** - Thinking completes, answer starts streaming:
```
🧠 Ragionamento

┌──────────────────────────────────────────────────┐
│ Analizzo la richiesta dell'utente               │
│ Uso get_tenants per cercare tutti i tenant      │
│ Ho trovato 5 tenant nel sistema                 │  <- Final thinking step
└──────────────────────────────────────────────────┘

Ecco i tenant disponibili:

| Tenant ID | Tenant Name | Tenant Label |
|-----------|-------------|--------------|
| 706 | ... | ... |                               <- Answer streams normally
```

**With retry scenario** (real-time view):
```
🧠 Ragionamento in corso... ⟳

┌──────────────────────────────────────────────────┐
│ L'utente chiede informazioni sul tenant "Acme"  │
│ Cerco con get_tenant_by_name("Acme Corp")       │
│ Nessun risultato trovato con il nome esatto     │  <- User sees retry happening
│ Riprovo con ricerca parziale "Acme"             │  <- Appears as AI works
│ Trovati 2 tenant che contengono "Acme"          │
│ Ora posso fornire i risultati all'utente        │
└──────────────────────────────────────────────────┘

Ecco i tenant che corrispondono alla tua ricerca:

| Tenant ID | Nome | Label |
|-----------|------|-------|
| 710 | Acme Corporation | Acme Corp - 3000123 |
| 715 | Acme Industries | Acme Ind - 3000456 |
```

**Benefits**:
- User sees AI's thought process **in real-time**
- Retry attempts visible **as they happen**
- No technical errors in the chat UI
- Educational: user learns about search strategies step-by-step
- Increased trust through live transparency
- Engaging: creates sense of active problem-solving

## UI Design

### Progressive Thinking Display

**Visual Design**:
- **Individual thinking steps**: Light blue boxes without icons
- **Container header**: Shows "🧠 Ragionamento in corso..." with spinner while streaming
- **Completed state**: Shows "🧠 Ragionamento" (no spinner)
- Light blue background (`bg-blue-50/70`)
- Blue border (`border-blue-100`)
- Smooth fade-in animation for each new step
- No collapse/expand - always visible when present

**Step Appearance**:
- Each step is a separate box
- No icons within individual steps (clean text-only display)
- Very small font size (`text-xs`)
- Light font weight (`font-light`)
- Adequate spacing between steps (`space-y-1.5`)
- Staggered animation delay for smooth appearance

**Loading States**:
- Spinner icon during streaming (in header only)
- "Ragionamento in corso..." while thinking
- Changes to "Ragionamento" when complete
- Visual divider appears after completion

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

1. **Real-Time Prefix-Based Streaming** (chosen approach)
   - Modify system prompt to instruct AI to prefix thinking lines with `💭 THINK:`
   - AI generates thinking steps progressively as it works
   - Frontend parses each chunk update in real-time
   - Each thinking step appears immediately as it's generated

2. **Why this approach**:
   - **Real-time visibility**: Users see thinking as it happens
   - **Model-agnostic**: Works with any provider
   - **Progressive disclosure**: Steps appear sequentially
   - **Simple parsing**: Line-by-line prefix detection
   - **No state management**: React re-renders handle everything
   - **Engaging UX**: Creates sense of AI actively working

### Data Flow

```
User Input
    ↓
API Route (/api/chat)
    ↓
AI Provider (with real-time thinking prompt)
    ↓
[STREAMING BEGINS]
    ↓
Chunk 1: "💭 THINK: Analizzo la richiesta..."
    ↓
Frontend receives chunk → MessageContent re-renders
    ↓
thinking-stream-parser.ts extracts step
    ↓
ThinkingStep component fades in
    ↓
Chunk 2: "\n💭 THINK: Cerco i tenant..."
    ↓
Frontend receives chunk → MessageContent re-renders
    ↓
Parser extracts both steps
    ↓
Second ThinkingStep fades in
    ↓
Chunk 3: "\nEcco i tenant:\n..."
    ↓
Parser detects answer content
    ↓
Thinking marked complete, answer renders
    ↓
[STREAMING CONTINUES with answer]
```

## Success Criteria

### Functional Requirements

- [ ] AI responses include thinking steps prefixed with `💭 THINK:`
- [ ] Thinking steps appear progressively during streaming
- [ ] Each step fades in smoothly
- [ ] Thinking displays before the main answer
- [ ] Loading indicator shows "Ragionamento in corso..." while streaming
- [ ] Status changes to "Ragionamento" when complete
- [ ] Technical errors hidden from chat UI
- [ ] Errors still logged to console
- [ ] Charts and other features continue to work
- [ ] Mobile responsive design maintained

### User Experience Requirements

- [ ] Thinking steps visually distinct (light blue boxes, no icons)
- [ ] Progressive display creates engaging experience
- [ ] Each step is easily readable
- [ ] Smooth fade-in animations for new steps
- [ ] Screen reader accessible
- [ ] Italian language maintained throughout
- [ ] Real-time feedback shows AI is working

### Performance Requirements

- [ ] No impact on streaming speed
- [ ] Smooth fade-in animations (60fps)
- [ ] No additional network requests
- [ ] Parser executes in < 5ms per chunk
- [ ] React re-renders optimized with useMemo
- [ ] No unnecessary re-parsing of unchanged content

## Future Enhancements

### Potential Improvements

1. **Thinking Preferences**
   - User setting to show/hide thinking by default
   - Minimize/maximize thinking section toggle
   - Export thinking with conversation
   - Thinking history search

2. **Enhanced Visualization**
   - Color-coded steps (planning=blue, searching=purple, analyzing=green, responding=gray)
   - Auto-categorize step types based on keywords
   - Timeline view for complex reasoning chains
   - Progress bar for multi-step operations

3. **Smart Thinking Display**
   - Collapse old thinking when new messages arrive
   - Highlight important steps (errors, retries)
   - Summary mode (show only key steps)
   - Expandable details for complex steps

4. **Analytics & Optimization**
   - Track thinking display engagement
   - Identify patterns in retry scenarios
   - Optimize prompt based on user feedback
   - A/B test different thinking formats

## Implementation Timeline

- **Phase 1**: Documentation and planning (2 hours)
- **Phase 2**: Core utilities (thinking-stream-parser.ts) (1.5 hours)
- **Phase 3**: UI components (thinking-step.tsx, thinking-steps-container.tsx) (2 hours)
- **Phase 4**: Backend modifications (real-time thinking prompt) (1 hour)
- **Phase 5**: Frontend integration (message-content.tsx, page.tsx) (2 hours)
- **Phase 6**: Testing (unit + manual + progressive rendering) (2.5 hours)
- **Phase 7**: Code review and refinement (1 hour)

**Total Estimated Time**: 12 hours

## References

- AGENTS.md - Development guidelines and standards
- docs/architecture.md - System architecture overview
- docs/features/project_features.md - Existing feature documentation
- AI SDK Documentation - Streaming and chat functionality
- Radix UI - Accessible component patterns

---

*Feature Specification v1.0 - Created 2025-10-16*
