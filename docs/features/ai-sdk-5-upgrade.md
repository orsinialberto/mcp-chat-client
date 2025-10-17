# AI SDK 4 to 5 Upgrade Plan

## Overview

Upgrade AI SDK from version 4.3.19 to 5.x to use the official `@ai-sdk/google` provider, which properly handles Gemini 2.0 tool calls without workarounds.

## Current State

- `ai`: 4.3.19
- `@ai-sdk/anthropic`: latest (1.2.12)
- `@ai-sdk/openai`: latest (1.3.23)
- Using `createOpenAI` with Gemini baseURL workaround
- Issues with `gemini-2.0-flash-exp` tool call index validation

## Target State

- `ai`: ^5.0.0 (latest stable)
- `@ai-sdk/google`: ^1.0.0
- `@ai-sdk/anthropic`: ^1.0.0 (SDK 5 compatible)
- `@ai-sdk/openai`: ^1.0.0 (SDK 5 compatible)
- Native Google provider with no workarounds

## Breaking Changes in AI SDK 5

### 1. Package Structure

- Provider packages now require AI SDK 5
- `ai/react` remains mostly compatible
- `experimental_createMCPClient` may be renamed or stabilized

### 2. API Changes

- `streamText` signature unchanged (backward compatible)
- `useChat` hook unchanged (backward compatible)
- MCP integration may have API changes

## Implementation Plan

### Phase 1: Backup and Preparation

1. Create a git branch: `feature/ai-sdk-5-upgrade`
2. Document current working state
3. Run tests to establish baseline: `npm test`
4. Take note of all working features

### Phase 2: Update Dependencies

**File**: `package.json`

Update dependencies to AI SDK 5 versions:

```json
"dependencies": {
  "ai": "^5.0.0",
  "@ai-sdk/anthropic": "^1.0.0",
  "@ai-sdk/google": "^1.0.0",
  "@ai-sdk/openai": "^1.0.0",
  // ... rest unchanged
}
```

Commands to run:

```bash
npm install ai@latest @ai-sdk/anthropic@latest @ai-sdk/openai@latest @ai-sdk/google@latest
```

### Phase 3: Update API Route (Backend)

**File**: `app/api/chat/route.ts`

**Changes needed**:

1. Add Google import:
```typescript
import { createGoogleGenerativeAI } from '@ai-sdk/google';
```

2. Replace Gemini case (lines 89-110):
```typescript
case "gemini":
  const geminiKey = apiKey || process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return new Response(
      JSON.stringify({
        error: "API Key Gemini non configurata",
        details: "Inserisci la tua API key Gemini nelle impostazioni o aggiungi GEMINI_API_KEY nel file .env.local",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
  
  // Use official Google AI SDK (now compatible with AI SDK 5)
  const googleClient = createGoogleGenerativeAI({
    apiKey: geminiKey
  });
  
  model = googleClient(selectedModel || "gemini-2.0-flash-exp");
  providerName = "Google Gemini"
  break
```

3. Remove OpenAI import if no longer needed for Gemini workaround

### Phase 4: Update MCP Integration

**File**: `lib/mcp/singleton.ts`

Check if `experimental_createMCPClient` has been renamed or stabilized in SDK 5.

Possible changes:

- `experimental_createMCPClient` → `createMCPClient` (if stabilized)
- Check AI SDK 5 changelog for MCP changes
- Update import if needed

### Phase 5: Verify Frontend Compatibility

**File**: `app/page.tsx`

The `useChat` hook should remain compatible, but verify:

- Import still works: `import { useChat } from 'ai/react'`
- Hook behavior unchanged
- Error handling still works

### Phase 6: Update Thinking Process Integration

The thinking process feature (Phase 5 from thinking-process-plan.md) can proceed after upgrade:

- Parser works at content level (unaffected)
- Components are independent (unaffected)
- Only system prompt and streaming affected (already implemented)

### Phase 7: Testing Plan

**Unit Tests**:

```bash
npm test
```

**Manual Testing Checklist**:

- [ ] Gemini provider works with tool calls
- [ ] Anthropic provider still works
- [ ] OpenAI provider still works (if configured)
- [ ] MCP tools are called correctly
- [ ] Streaming works properly
- [ ] Error handling works
- [ ] Test all queries that previously failed:
  - "puoi darmi l'elenco di tutti i tenant?"
  - "dammi tutti i tenant"
  - Complex queries with multiple tool calls

**Provider-Specific Tests**:

- [ ] Gemini 2.0 Flash Exp with tool calls
- [ ] Gemini 1.5 Flash fallback
- [ ] Claude 3.5 Sonnet
- [ ] Each provider with and without MCP tools

### Phase 8: Rollback Plan

If upgrade fails:

```bash
git checkout main
npm install
rm -rf .next node_modules package-lock.json
npm install
```

Or revert specific packages:

```bash
npm install ai@4.3.19 @ai-sdk/anthropic@1.2.12 @ai-sdk/openai@1.3.23
npm uninstall @ai-sdk/google
```

### Phase 9: Documentation Updates

**Update files**:

- `docs/features/thinking-process-plan.md` - Note SDK 5 requirement
- `README.md` - Update AI SDK version requirement
- `.env.example` - Ensure GEMINI_API_KEY is documented

## Risk Assessment

**Low Risk**:

- `useChat` hook (backward compatible)
- Basic streaming functionality
- Error handling

**Medium Risk**:

- MCP integration (may have API changes)
- Provider-specific features

**High Risk**:

- Tool calling behavior (this is what we're fixing)
- Gemini 2.0 compatibility

## Success Criteria

- [ ] All three providers work (Gemini, Anthropic, OpenAI)
- [ ] Tool calls work reliably with Gemini 2.0
- [ ] No index validation errors
- [ ] All existing tests pass
- [ ] No regressions in other features
- [ ] MCP integration still functional
- [ ] Ready to proceed with thinking process feature (Phase 5)

## Timeline Estimate

- **Phase 1-2**: 15 minutes (backup + dependencies)
- **Phase 3-5**: 30 minutes (code changes)
- **Phase 6**: N/A (not yet implemented)
- **Phase 7**: 30 minutes (testing)
- **Phase 8**: N/A (only if needed)
- **Phase 9**: 15 minutes (documentation)

**Total**: ~90 minutes

## Post-Upgrade Benefits

1. Native Gemini support with proper tool call handling
2. No more custom transform streams or workarounds
3. Better compatibility with future Gemini models
4. Simpler codebase (remove OpenAI baseURL hack)
5. Access to Google-specific features
6. Foundation for thinking process feature implementation

## Notes

- AI SDK 5 is the current stable version
- All provider packages already at "latest" in package.json
- Main change is updating core `ai` package
- Minimal breaking changes expected (mostly provider-specific)
- Can use `gemini-2.0-flash-exp` safely after upgrade

---

*AI SDK 5 Upgrade Plan - Created 2025-10-17*

