import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Login page
 * Provides methods to interact with login form elements
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('submit-button');
    this.errorAlert = page.getByTestId('error-alert');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Perform a complete login action
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  /**
   * Check if an error message is displayed
   */
  async hasError() {
    return await this.errorAlert.isVisible();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage() {
    return await this.errorAlert.textContent();
  }

  /**
   * Wait for navigation to complete after successful login
   */
  async waitForDashboardRedirect() {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  /**
   * Verify that user is on the login page
   */
  async verifyOnLoginPage() {
    await expect(this.page).toHaveURL(/.*login/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}

