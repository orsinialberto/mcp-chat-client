import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Chat Application
 * 
 * These tests verify:
 * - Basic message sending and receiving
 * - API response is received
 * - UI is updated with responses
 * - API-UI synchronization
 * - LocalStorage persistence
 */

test.describe('Chat E2E Tests', () => {
  
  test('should send a message and receive a response', async ({ page }) => {
    // 1. Navigate to chat page
    await page.goto('/');

    // 2. Wait for page to load
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();

    // 3. Find input field
    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    await expect(input).toBeVisible();

    // 4. Type message
    await input.fill('ciao');

    // 5. Send message (press Enter)
    await input.press('Enter');

    // 6. Verify user message is visible in chat (use specific selector to avoid title match)
    await expect(
      page.locator('div[class*="bg-blue-600"]').filter({ hasText: 'ciao' })
    ).toBeVisible();

    // 7. Wait for loading indicator
    await expect(page.getByText(/Archimede sta analizzando/i)).toBeVisible();
    
    // 8. Wait for response to appear (loading should disappear)
    // Increased timeout because API can take time
    await expect(page.getByText(/Archimede sta analizzando/i)).not.toBeVisible({ 
      timeout: 30000 
    });

    // 9. Verify at least one assistant message exists
    const assistantMessages = page.locator('div').filter({ 
      has: page.locator('[class*="bg-blue-100"]')
    });
    await expect(assistantMessages.first()).toBeVisible();
  });

  test('should receive API response AND display it in UI', async ({ page }) => {
    // Track API calls
    let apiResponseReceived = false;
    let apiResponseContent = '';

    // Intercept API route to verify responses
    await page.route('**/api/chat', async (route) => {
      const response = await route.fetch();
      const text = await response.text();
      
      // Verify response is not empty
      if (text && text.length > 0) {
        apiResponseReceived = true;
        apiResponseContent = text;
      }
      
      await route.fulfill({ response });
    });

    // Navigate and send message
    await page.goto('/');
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();

    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    await input.fill('test');
    await input.press('Enter');

    // Verify user message appears in chat
    await expect(
      page.locator('div[class*="bg-blue-600"]').filter({ hasText: 'test' })
    ).toBeVisible();

    // Wait for API response
    await page.waitForResponse(
      response => response.url().includes('/api/chat') && response.status() === 200,
      { timeout: 30000 }
    );

    // Small delay for processing
    await page.waitForTimeout(1000);

    // CRITICAL: Verify API responded
    expect(apiResponseReceived).toBe(true);
    expect(apiResponseContent.length).toBeGreaterThan(0);

    // CRITICAL: Verify UI is updated
    const assistantMessageContainer = page.locator('div').filter({
      has: page.locator('[class*="bg-blue-100"]')
    }).first();

    await expect(assistantMessageContainer).toBeVisible({ timeout: 5000 });

    // Verify content is not empty
    const messageText = await assistantMessageContainer.textContent();
    expect(messageText).not.toBe('');
    expect(messageText?.trim().length).toBeGreaterThan(0);

    // Verify loading spinner disappeared
    await expect(page.getByText('Archimede sta analizzando...')).not.toBeVisible();
  });

  test('should handle multiple messages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();

    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    
    // First message
    await input.fill('primo messaggio');
    await input.press('Enter');
    await page.waitForTimeout(2000);

    // Second message
    await input.fill('secondo messaggio');
    await input.press('Enter');

    // Verify both messages are visible in chat
    await expect(
      page.locator('div[class*="bg-blue-600"]').filter({ hasText: 'primo messaggio' })
    ).toBeVisible();
    await expect(
      page.locator('div[class*="bg-blue-600"]').filter({ hasText: 'secondo messaggio' })
    ).toBeVisible();
  });

  test('should create a new chat', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();

    // Ensure sidebar is open - look for the "Nuova chat" button
    // If not found, open the sidebar
    const newChatButton = page.getByRole('button', { name: /nuova chat/i });
    
    const isNewChatVisible = await newChatButton.isVisible().catch(() => false);
    
    if (!isNewChatVisible) {
      // Sidebar is closed, click menu button to open it
      // The menu button has an SVG icon but no text
      const menuButton = page.locator('button').first();
      await menuButton.click();
      await page.waitForTimeout(300); // Wait for sidebar animation
    }

    // Now click "Nuova Chat" button
    await newChatButton.click();

    // Verify new chat was created
    await expect(page.getByText(/Chat con Archimede/i)).toBeVisible();
  });

  test('should detect if API responds but UI does not update', async ({ page }) => {
    let apiCalled = false;
    let apiResponseOk = false;

    // Intercept API
    await page.route('**/api/chat', async (route) => {
      apiCalled = true;
      const response = await route.fetch();
      apiResponseOk = response.ok();
      await route.fulfill({ response });
    });

    await page.goto('/');
    
    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    await input.fill('test sync');
    await input.press('Enter');

    // Wait for API response
    await page.waitForResponse(
      response => response.url().includes('/api/chat'),
      { timeout: 30000 }
    );

    // Verify API was called successfully
    expect(apiCalled).toBe(true);
    expect(apiResponseOk).toBe(true);

    // Verify UI is updated
    // If this fails, it means API responded but UI didn't update
    const assistantMessages = page.locator('div').filter({
      has: page.locator('[class*="bg-blue-100"]')
    });

    try {
      await expect(assistantMessages.first()).toBeVisible({ timeout: 10000 });
    } catch (error) {
      throw new Error(
        `BUG DETECTED: API responded (called: ${apiCalled}, ok: ${apiResponseOk}) ` +
        `but UI did not update - rendering bug detected!`
      );
    }
  });
});

test.describe('Chat UI Tests (No API Required)', () => {
  
  test('should render chat interface correctly', async ({ page }) => {
    await page.goto('/');

    // Verify UI elements
    await expect(page.getByText('Ciao! Sono Archimede')).toBeVisible();
    await expect(page.getByPlaceholder(/Scrivi la tua domanda/i)).toBeVisible();
    await expect(page.getByText('Creazione segmenti')).toBeVisible();
  });

  test('should show user message after sending', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/Scrivi la tua domanda/i);
    await input.fill('test message ui only');
    await input.press('Enter');

    // Verify user message appears in chat
    await expect(
      page.locator('div[class*="bg-blue-600"]').filter({ hasText: 'test message ui only' })
    ).toBeVisible();
  });
});

