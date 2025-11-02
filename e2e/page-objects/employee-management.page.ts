import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Employee Management page
 * Provides methods to interact with employee management elements
 */
export class EmployeeManagementPage {
  readonly page: Page;
  readonly addEmployeeButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly pinInput: Locator;
  readonly departmentSelect: Locator;
  readonly statusSwitch: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly employeeTable: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addEmployeeButton = page.getByTestId("add-employee-button");
    this.firstNameInput = page.getByTestId("employee-first-name");
    this.lastNameInput = page.getByTestId("employee-last-name");
    this.pinInput = page.getByTestId("employee-pin");
    this.departmentSelect = page.getByTestId("employee-department");
    this.statusSwitch = page.getByTestId("employee-status");
    this.submitButton = page.getByTestId("submit-add-employee");
    this.cancelButton = page.getByTestId("cancel-add-employee");
    this.employeeTable = page.locator("table");
    this.searchInput = page.getByPlaceholder("Search employees by name...");
  }

  /**
   * Navigate to the employee management page
   */
  async goto() {
    await this.page.goto("/admin/employees");
  }

  /**
   * Open the add employee dialog
   */
  async openAddEmployeeDialog() {
    await this.addEmployeeButton.click();
    // Wait for dialog to be visible
    await this.firstNameInput.waitFor({ state: "visible" });
  }

  /**
   * Fill in the first name field
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill in the last name field
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill in the PIN field
   */
  async fillPin(pin: string) {
    await this.pinInput.fill(pin);
  }

  /**
   * Select a department from the dropdown
   */
  async selectDepartment(department: string) {
    await this.departmentSelect.click();
    // Wait for dropdown to be visible and click the option
    await this.page.getByRole("option", { name: department }).click();
  }

  /**
   * Toggle the active status switch
   */
  async toggleStatus() {
    await this.statusSwitch.click();
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Click the cancel button
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Fill the complete add employee form
   */
  async fillAddEmployeeForm(data: {
    firstName: string;
    lastName: string;
    pin: string;
    department?: string;
    isActive?: boolean;
  }) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillPin(data.pin);

    if (data.department) {
      await this.selectDepartment(data.department);
    }

    // Handle status toggle - default is active (true)
    // Only click if we want to change it to inactive
    if (data.isActive === false) {
      await this.toggleStatus();
    }
  }

  /**
   * Add a new employee with complete workflow
   */
  async addEmployee(data: {
    firstName: string;
    lastName: string;
    pin: string;
    department?: string;
    isActive?: boolean;
  }) {
    await this.openAddEmployeeDialog();
    await this.fillAddEmployeeForm(data);
    await this.clickSubmit();
  }

  /**
   * Search for an employee by name
   */
  async searchEmployee(name: string) {
    await this.searchInput.fill(name);
  }

  /**
   * Wait for the success toast notification
   */
  async waitForSuccessToast() {
    const toast = this.page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible", timeout: 5000 });
    return toast;
  }

  /**
   * Wait for the error toast notification
   */
  async waitForErrorToast() {
    const toast = this.page.locator('[data-sonner-toast][data-type="error"]');
    await toast.waitFor({ state: "visible", timeout: 5000 });
    return toast;
  }

  /**
   * Check if employee exists in the table
   */
  async findEmployeeInTable(firstName: string, lastName: string) {
    const fullName = `${firstName} ${lastName}`;
    const row = this.page.locator("table tbody tr", {
      has: this.page.locator("td", { hasText: fullName }),
    });
    return row;
  }

  /**
   * Verify employee appears in the table
   */
  async verifyEmployeeExists(firstName: string, lastName: string) {
    const row = await this.findEmployeeInTable(firstName, lastName);
    await expect(row).toBeVisible();
  }

  /**
   * Get the employee count from the badge
   */
  async getEmployeeCount(): Promise<number> {
    const badge = this.page
      .locator('[class*="badge"]')
      .filter({ hasText: "employees" })
      .first();
    const text = await badge.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Verify that user is on the employee management page
   */
  async verifyOnEmployeeManagementPage() {
    await expect(this.page).toHaveURL(/.*admin\/employees/);
    await expect(this.addEmployeeButton).toBeVisible();
  }

  /**
   * Wait for the table to finish loading
   */
  async waitForTableLoad() {
    // Wait for the loading spinner to disappear if it exists
    const loader = this.page.locator('[class*="animate-spin"]');
    await loader.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {
      // If no loader found, that's fine - table might already be loaded
    });
  }
}
