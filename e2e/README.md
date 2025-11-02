# E2E Tests with Playwright

This directory contains end-to-end tests for the TimeTrack application using Playwright.

## Structure

```
e2e/
├── page-objects/        # Page Object Models for better test maintainability
│   └── login.page.ts   # Login page object
└── login.spec.ts       # Login functionality tests
```

## Setup

### Environment Variables

Before running tests, create a `.env.test` file in the project root:

```bash
# Copy example file
cp .env.test.example .env.test
```

Then fill in your test environment variables (Supabase URL, keys, etc.).

**Note:** The `.env.test` file is automatically loaded by Playwright and is git-ignored for security.

## Running Tests

### Run all E2E tests

```bash
pnpm test:e2e
```

**The dev server will start automatically!** Playwright will:

1. Load environment variables from `.env.test`
2. Start the Astro dev server on `http://localhost:4321`
3. Run all tests
4. Stop the server when done

### Run tests with UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

### Debug tests

```bash
pnpm test:e2e:debug
```

## Writing Tests

### Page Object Model

We use the Page Object Model pattern to make tests more maintainable. Each page has its own class that encapsulates:

- Element locators
- Page interactions
- Common assertions

Example:

```typescript
import { LoginPage } from "./page-objects/login.page";

test("example test", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("user@example.com", "password");
});
```

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
test("should do something", async ({ page }) => {
  // Arrange: Set up test data and initial state
  const loginPage = new LoginPage(page);
  const email = "test@example.com";

  // Act: Perform the action being tested
  await loginPage.login(email, "password");

  // Assert: Verify the expected outcome
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Locators

Use `data-testid` attributes for reliable element selection:

```typescript
// In component
<Button data-testid="submit-button">Submit</Button>;

// In test
await page.getByTestId("submit-button").click();
```

## Test Credentials

For testing purposes, use these credentials:

- Email: `admin@test.timefly.pl`
- Password: `Test123!@#`

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

Key settings:

- **Environment**: Loads variables from `.env.test`
- **Browser**: Chromium, Firefox, and WebKit (can run all or select specific ones)
- **Base URL**: `http://localhost:4321` (Astro dev server)
- **Web Server**: Automatically starts `pnpm dev` before tests
- **Server Reuse**: Reuses existing server in local dev (not in CI)
- **Trace**: Captured on first retry for debugging
- **Screenshots**: Taken on failure
- **Video**: Recorded on failure for debugging

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Page Objects**: Use page objects for better code reuse and maintainability
3. **Explicit Waits**: Use Playwright's built-in waiting mechanisms
4. **Test Data**: Use `data-testid` attributes for stable selectors
5. **Parallel Execution**: Tests run in parallel by default for faster execution
6. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested

## Debugging

### View test traces

After a test failure, view the trace:

```bash
npx playwright show-trace trace.zip
```

### Generate tests using Codegen

```bash
npx playwright codegen http://localhost:4321
```

### View test report

```bash
npx playwright show-report
```

## CI/CD

In CI environments:

- Tests automatically retry up to 2 times on failure
- Tests run sequentially to avoid resource issues
- HTML report is generated for analysis
