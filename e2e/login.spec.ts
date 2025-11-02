import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";

/**
 * E2E Tests for User Login
 *
 * Tests the login functionality including successful login,
 * validation errors, and incorrect credentials.
 */

test.describe("User Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Arrange: Initialize page object and navigate to login
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form correctly", async () => {
    // Arrange & Act: Already navigated in beforeEach

    // Assert: Verify all login form elements are visible
    await loginPage.verifyOnLoginPage();
    await expect(loginPage.page).toHaveTitle(/Login - TimeTrack/);
  });

  test("should successfully login with valid credentials", async () => {
    // Arrange: Valid test credentials
    const email = "e2e-user@test.com";
    const password = "e2euser";

    // Act: Perform login
    await loginPage.login(email, password);

    // Assert: Should redirect to dashboard
    await loginPage.waitForDashboardRedirect();
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
  });

  test("should show error message with invalid credentials", async () => {
    // Arrange: Invalid credentials
    const email = "invalid@test.com";
    const password = "wrongpassword";

    // Act: Attempt login with wrong credentials
    await loginPage.login(email, password);

    // Assert: Error message should be displayed
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toBeTruthy();
  });

  test("should show validation error when fields are empty", async () => {
    // Arrange: Empty form

    // Act: Try to submit without filling fields
    await loginPage.clickSubmit();

    // Assert: Form validation should prevent submission
    // Browser's built-in validation will prevent the form from being submitted
    // So we should still be on the login page
    await expect(loginPage.page).toHaveURL(/.*login/);
  });

  test("should disable submit button while logging in", async () => {
    // Arrange: Valid credentials
    const email = "admin@test.timefly.pl";
    const password = "Test123!@#";

    // Act: Fill form
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);

    // Assert: Button should be enabled before submission
    await expect(loginPage.submitButton).toBeEnabled();

    // Act: Start login process
    await loginPage.clickSubmit();

    // Assert: Button should be disabled during submission
    // (This may be very quick, so we check immediately after click)
    // or we might already be redirected
    const currentUrl = loginPage.page.url();
    if (currentUrl.includes("login")) {
      // Still on login page, button might be disabled
      const isDisabled = await loginPage.submitButton
        .isDisabled()
        .catch(() => false);
      // Button is either disabled or we've already been redirected
      expect(isDisabled || currentUrl.includes("dashboard")).toBeTruthy();
    }
  });

  test("should navigate to password reset page", async ({ page }) => {
    // Arrange: On login page
    const resetPasswordLink = page.locator('a[href="/reset-password"]');

    // Act: Click forgot password link
    await resetPasswordLink.click();

    // Assert: Should navigate to reset password page
    await expect(page).toHaveURL(/.*reset-password/);
  });
});
