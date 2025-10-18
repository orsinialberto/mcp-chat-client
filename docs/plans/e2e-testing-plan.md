# E2E Testing - Implementation Plan

## Overview
Implementation guide for E2E Testing as specified in `docs/features/e2e-testing.md`.
Follows guidelines in AGENTS.md.

## Development Checklist

### Phase 1: Documentation ✅ COMPLETED
- [x] Create feature specification
- [x] Create implementation plan
- [x] Commit and push documentation

### Phase 2: Playwright Setup ✅ COMPLETED
- [x] **Task 2.1**: Install Playwright dependencies
  - [x] Run `npm install -D @playwright/test`
  - [x] Run `npx playwright install`
  - [x] Verify installation success

- [x] **Task 2.2**: Create Playwright configuration
  - [x] Create `playwright.config.ts` in project root
  - [x] Configure test directory as `e2e/`
  - [x] Set base URL to `http://localhost:3000`
  - [x] Configure webServer to auto-start Next.js
  - [x] Set timeout to 120s for dev server startup
  - [x] Enable screenshot on failure
  - [x] Configure trace on first retry

- [x] **Task 2.3**: Update package.json scripts
  - [x] Add `test:e2e` script
  - [x] Add `test:e2e:ui` script for UI mode
  - [x] Add `test:e2e:debug` script for debugging

### Phase 3: Core E2E Tests ✅ COMPLETED
- [x] **Task 3.1**: Create test directory and base test file
  - [x] Create `e2e/` directory
  - [x] Create `e2e/chat.spec.ts` file
  - [x] Add test imports and setup

- [x] **Task 3.2**: Implement basic message test
  - [x] Navigate to chat page
  - [x] Wait for page load
  - [x] Find input field
  - [x] Send "ciao" message
  - [x] Verify user message appears in UI
  - [x] Verify loading indicator appears
  - [x] Wait for assistant response
  - [x] Verify assistant message appears

- [x] **Task 3.3**: Implement API-UI sync verification test
  - [x] Intercept `/api/chat` route
  - [x] Track API call and response
  - [x] Send test message
  - [x] Verify API returns 200
  - [x] Verify API response is not empty
  - [x] Verify message appears in DOM
  - [x] Verify message content is not empty
  - [x] Verify loading spinner disappears
  - [x] Fail test if API succeeds but UI doesn't update

### Phase 4: Advanced Tests ✅ COMPLETED
- [x] **Task 4.1**: Multiple messages test
  - [x] Send first message
  - [x] Wait for response
  - [x] Send second message
  - [x] Verify both messages visible

- [x] **Task 4.2**: New chat creation test
  - [x] Open sidebar
  - [x] Click "Nuova Chat" button
  - [x] Verify new chat created
  - [x] Verify empty message list

- [x] **Task 4.3**: LocalStorage persistence test
  - [x] Send message and get response
  - [x] Verify data saved in localStorage
  - [x] Reload page
  - [x] Verify messages still visible

- [x] **Task 4.4**: UI-only tests (no API required)
  - [x] Test chat interface renders
  - [x] Test welcome message displays
  - [x] Test quick action buttons visible
  - [x] Test user message appears after send

### Phase 5: Error Handling Tests ⏭️ SKIPPED
- [ ] **Task 5.1**: Test without API key (future enhancement)
- [ ] **Task 5.2**: Test API timeout (future enhancement)

### Phase 6: CI/CD Integration ⏭️ SKIPPED
- [ ] **Task 6.1**: Update GitHub Actions workflow (future enhancement)
- [ ] **Task 6.2**: Add test reporting (future enhancement)

### Phase 7: Documentation & Review ✅ COMPLETED
- [x] **Task 7.1**: Update README
  - [x] Add E2E testing section
  - [x] Document how to run tests
  - [x] Document test coverage

- [x] **Task 7.2**: Code review checklist
  - [x] All tests pass locally
  - [x] Tests follow naming conventions
  - [x] Tests are reliable (no flakiness)
  - [x] Code follows AGENTS.md guidelines
  - [x] No console.logs in test code

- [x] **Task 7.3**: Update features.md
  - [x] Add E2E testing to implemented features list
  - [x] Document test coverage details

- [x] **Task 7.4**: Update AGENTS.md
  - [x] Add E2E testing workflow
  - [x] Document "stop for testing" principle
  - [x] Add rule: never auto-execute tests

## Technical Implementation Details

### Architecture Decision: Playwright vs Cypress
**Decision**: Use Playwright
**Rationale**: 
- Officially recommended by Next.js
- Better performance and speed
- Native TypeScript support
- Auto-waits for elements
- Better CI/CD integration
- Modern API design

### Architecture Decision: Test Structure
**Decision**: Organize tests by feature, not by type
**Rationale**:
- Easier to maintain
- Tests grouped with related functionality
- Clear test purpose
- Follows Next.js conventions

### File Structure

**New Files**:
```
e2e/
├── chat.spec.ts          # Main chat functionality tests
└── utils.ts              # Shared test utilities (optional)

playwright.config.ts      # Playwright configuration
.gitignore                # Add playwright-report/ and test-results/
```

**Modified Files**:
```
package.json              # Add test scripts and Playwright dependency
README.md                 # Add E2E testing documentation
docs/features.md          # Add E2E testing feature
```

## Testing Strategy

### Unit Tests (Existing)
Continue using Jest for component and utility testing.

### E2E Tests (New)
- **Critical Path**: Message send → API response → UI display
- **User Flows**: New chat, multiple messages, persistence
- **Error Cases**: Missing API key, API errors
- **UI Only**: Interface rendering without API calls

### Test Execution
```bash
# Run all tests
npm test                 # Unit tests
npm run test:e2e         # E2E tests

# Run specific test file
npx playwright test e2e/chat.spec.ts

# Debug mode
npm run test:e2e:debug

# UI mode
npm run test:e2e:ui
```

### Coverage Goals
- 100% of critical user flows
- All error scenarios
- Cross-browser (Chrome default, Firefox/Safari optional)

## Code Examples

### Playwright Config
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Chat E2E Tests', () => {
  test('should send message and receive response', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();
    
    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    await input.fill('ciao');
    await input.press('Enter');
    
    await expect(page.getByText('ciao')).toBeVisible();
    await page.waitForSelector('[class*="bg-blue-100"]', { timeout: 30000 });
  });
});
```

### API Interception Test
```typescript
test('should detect API-UI sync issues', async ({ page }) => {
  let apiResponseReceived = false;

  await page.route('**/api/chat', async (route) => {
    const response = await route.fetch();
    apiResponseReceived = response.ok();
    await route.fulfill({ response });
  });

  await page.goto('/');
  const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
  await input.fill('test');
  await input.press('Enter');

  await page.waitForResponse(res => res.url().includes('/api/chat'));
  
  expect(apiResponseReceived).toBe(true);
  
  // Verify UI updated
  const assistantMessage = page.locator('[class*="bg-white"][class*="border"]').last();
  await expect(assistantMessage).toBeVisible({ timeout: 10000 });
});
```

## References
- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- AGENTS.md - Testing section
- docs/features/e2e-testing.md

