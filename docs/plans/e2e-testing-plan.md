# E2E Testing - Implementation Plan

## Overview
Implementation guide for E2E Testing as specified in `docs/features/e2e-testing.md`.
Follows guidelines in AGENTS.md.

## Development Checklist

### Phase 1: Documentation ✅ COMPLETED
- [x] Create feature specification
- [x] Create implementation plan
- [x] Commit and push documentation

### Phase 2: Playwright Setup
- [ ] **Task 2.1**: Install Playwright dependencies
  - [ ] Run `npm install -D @playwright/test`
  - [ ] Run `npx playwright install`
  - [ ] Verify installation success

- [ ] **Task 2.2**: Create Playwright configuration
  - [ ] Create `playwright.config.ts` in project root
  - [ ] Configure test directory as `e2e/`
  - [ ] Set base URL to `http://localhost:3000`
  - [ ] Configure webServer to auto-start Next.js
  - [ ] Set timeout to 120s for dev server startup
  - [ ] Enable screenshot on failure
  - [ ] Configure trace on first retry

- [ ] **Task 2.3**: Update package.json scripts
  - [ ] Add `test:e2e` script
  - [ ] Add `test:e2e:ui` script for UI mode
  - [ ] Add `test:e2e:debug` script for debugging

### Phase 3: Core E2E Tests
- [ ] **Task 3.1**: Create test directory and base test file
  - [ ] Create `e2e/` directory
  - [ ] Create `e2e/chat.spec.ts` file
  - [ ] Add test imports and setup

- [ ] **Task 3.2**: Implement basic message test
  - [ ] Navigate to chat page
  - [ ] Wait for page load
  - [ ] Find input field
  - [ ] Send "ciao" message
  - [ ] Verify user message appears in UI
  - [ ] Verify loading indicator appears
  - [ ] Wait for assistant response
  - [ ] Verify assistant message appears

- [ ] **Task 3.3**: Implement API-UI sync verification test
  - [ ] Intercept `/api/chat` route
  - [ ] Track API call and response
  - [ ] Send test message
  - [ ] Verify API returns 200
  - [ ] Verify API response is not empty
  - [ ] Verify message appears in DOM
  - [ ] Verify message content is not empty
  - [ ] Verify loading spinner disappears
  - [ ] Fail test if API succeeds but UI doesn't update

### Phase 4: Advanced Tests
- [ ] **Task 4.1**: Multiple messages test
  - [ ] Send first message
  - [ ] Wait for response
  - [ ] Send second message
  - [ ] Verify both messages visible

- [ ] **Task 4.2**: New chat creation test
  - [ ] Open sidebar
  - [ ] Click "Nuova Chat" button
  - [ ] Verify new chat created
  - [ ] Verify empty message list

- [ ] **Task 4.3**: LocalStorage persistence test
  - [ ] Send message and get response
  - [ ] Verify data saved in localStorage
  - [ ] Reload page
  - [ ] Verify messages still visible

- [ ] **Task 4.4**: UI-only tests (no API required)
  - [ ] Test chat interface renders
  - [ ] Test welcome message displays
  - [ ] Test quick action buttons visible
  - [ ] Test user message appears after send

### Phase 5: Error Handling Tests
- [ ] **Task 5.1**: Test without API key
  - [ ] Clear localStorage API keys
  - [ ] Send message
  - [ ] Verify appropriate error message

- [ ] **Task 5.2**: Test API timeout
  - [ ] Mock slow API response
  - [ ] Verify timeout handling
  - [ ] Verify error message shown

### Phase 6: CI/CD Integration
- [ ] **Task 6.1**: Update GitHub Actions workflow (if exists)
  - [ ] Add Playwright test step
  - [ ] Install browsers in CI
  - [ ] Run tests on pull requests

- [ ] **Task 6.2**: Add test reporting
  - [ ] Configure HTML reporter
  - [ ] Add artifacts upload for failed tests

### Phase 7: Documentation & Review
- [ ] **Task 7.1**: Update README
  - [ ] Add E2E testing section
  - [ ] Document how to run tests
  - [ ] Document test coverage

- [ ] **Task 7.2**: Code review checklist
  - [ ] All tests pass locally
  - [ ] Tests follow naming conventions
  - [ ] Tests are reliable (no flakiness)
  - [ ] Code follows AGENTS.md guidelines
  - [ ] No console.logs in test code

- [ ] **Task 7.3**: Update features.md
  - [ ] Add E2E testing to implemented features list
  - [ ] Document test coverage details

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

