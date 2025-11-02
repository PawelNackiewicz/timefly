import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";
import { EmployeeManagementPage } from "./page-objects/employee-management.page";

/**
 * E2E Tests for Employee Management
 *
 * Tests the employee management functionality including adding new employees,
 * validation errors, and displaying employees in the table.
 */

test.describe("Employee Management", () => {
  let loginPage: LoginPage;
  let employeePage: EmployeeManagementPage;

  test.beforeEach(async ({ page }) => {
    // Arrange: Login as admin before each test
    loginPage = new LoginPage(page);
    employeePage = new EmployeeManagementPage(page);

    // Login with admin credentials
    await loginPage.goto();
    await loginPage.login("admin@test.timefly.pl", "Test123!@#");
    await loginPage.waitForDashboardRedirect();

    // Navigate to employee management page
    await employeePage.goto();
    await employeePage.verifyOnEmployeeManagementPage();
    await employeePage.waitForTableLoad();
  });

  test("should display employee management page correctly", async () => {
    // Assert: Verify page elements are visible
    await expect(employeePage.addEmployeeButton).toBeVisible();
    await expect(employeePage.employeeTable).toBeVisible();
    await expect(employeePage.searchInput).toBeVisible();
  });

  test("should successfully add a new employee with all fields", async () => {
    // Arrange: Generate unique employee data
    const timestamp = Date.now();
    const employeeData = {
      firstName: `John`,
      lastName: `Doe${timestamp}`,
      pin: "1234",
      department: "Development",
    };

    // Get initial employee count
    const initialCount = await employeePage.getEmployeeCount();

    // Act: Add new employee
    await employeePage.addEmployee(employeeData);

    // Assert: Wait for success toast
    const toast = await employeePage.waitForSuccessToast();
    await expect(toast).toContainText(/success/i);

    // Assert: Verify employee appears in table
    await employeePage.verifyEmployeeExists(
      employeeData.firstName,
      employeeData.lastName
    );

    // Assert: Verify employee count increased
    const newCount = await employeePage.getEmployeeCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test("should successfully add a new employee with only required fields", async () => {
    // Arrange: Generate employee data without optional fields
    const timestamp = Date.now();
    const employeeData = {
      firstName: `Jane`,
      lastName: `Smith${timestamp}`,
      pin: "5678",
    };

    // Act: Add new employee
    await employeePage.addEmployee(employeeData);

    // Assert: Wait for success toast
    const toast = await employeePage.waitForSuccessToast();
    await expect(toast).toContainText(/success/i);

    // Assert: Verify employee appears in table
    await employeePage.verifyEmployeeExists(
      employeeData.firstName,
      employeeData.lastName
    );
  });

  test("should show validation error when first name is empty", async ({
    page,
  }) => {
    // Arrange: Open add employee dialog
    await employeePage.openAddEmployeeDialog();

    // Act: Fill form without first name
    await employeePage.fillLastName("Doe");
    await employeePage.fillPin("1234");
    await employeePage.clickSubmit();

    // Assert: Error toast should appear
    const toast = await employeePage.waitForErrorToast();
    await expect(toast).toContainText(/first name is required/i);

    // Assert: Dialog should still be open
    await expect(employeePage.submitButton).toBeVisible();
  });

  test("should show validation error when last name is empty", async ({
    page,
  }) => {
    // Arrange: Open add employee dialog
    await employeePage.openAddEmployeeDialog();

    // Act: Fill form without last name
    await employeePage.fillFirstName("John");
    await employeePage.fillPin("1234");
    await employeePage.clickSubmit();

    // Assert: Error toast should appear
    const toast = await employeePage.waitForErrorToast();
    await expect(toast).toContainText(/last name is required/i);

    // Assert: Dialog should still be open
    await expect(employeePage.submitButton).toBeVisible();
  });

  test("should show validation error when PIN is too short", async ({
    page,
  }) => {
    // Arrange: Open add employee dialog
    await employeePage.openAddEmployeeDialog();

    // Act: Fill form with short PIN
    await employeePage.fillFirstName("John");
    await employeePage.fillLastName("Doe");
    await employeePage.fillPin("123"); // Only 3 digits
    await employeePage.clickSubmit();

    // Assert: Error toast should appear
    const toast = await employeePage.waitForErrorToast();
    await expect(toast).toContainText(/PIN must be 4-6 digits/i);

    // Assert: Dialog should still be open
    await expect(employeePage.submitButton).toBeVisible();
  });

  test("should show error when PIN already exists", async ({ page }) => {
    // Arrange: Add first employee
    const timestamp = Date.now();
    const firstEmployee = {
      firstName: `First`,
      lastName: `Employee${timestamp}`,
      pin: `9999`,
    };

    await employeePage.addEmployee(firstEmployee);
    await employeePage.waitForSuccessToast();

    // Wait a bit for the dialog to close
    await page.waitForTimeout(1000);

    // Act: Try to add another employee with the same PIN
    const secondEmployee = {
      firstName: `Second`,
      lastName: `Employee${timestamp}`,
      pin: `9999`, // Same PIN as first employee
    };

    await employeePage.openAddEmployeeDialog();
    await employeePage.fillAddEmployeeForm(secondEmployee);
    await employeePage.clickSubmit();

    // Assert: Error toast should appear about duplicate PIN
    const toast = await employeePage.waitForErrorToast();
    await expect(toast).toContainText(/PIN already exists/i);
  });

  test("should cancel adding employee and close dialog", async () => {
    // Arrange: Open add employee dialog
    await employeePage.openAddEmployeeDialog();

    // Act: Fill some data
    await employeePage.fillFirstName("John");
    await employeePage.fillLastName("Doe");

    // Act: Click cancel
    await employeePage.clickCancel();

    // Assert: Dialog should be closed
    await expect(employeePage.submitButton).not.toBeVisible();
  });

  test("should disable submit button while adding employee", async ({
    page,
  }) => {
    // Arrange: Generate employee data
    const timestamp = Date.now();
    const employeeData = {
      firstName: `Test`,
      lastName: `User${timestamp}`,
      pin: "4567",
    };

    // Act: Open dialog and fill form
    await employeePage.openAddEmployeeDialog();
    await employeePage.fillAddEmployeeForm(employeeData);

    // Assert: Button should be enabled before submission
    await expect(employeePage.submitButton).toBeEnabled();

    // Act: Click submit
    await employeePage.clickSubmit();

    // Assert: Button should be disabled during submission (if still visible)
    // Note: This might be quick, so we check if either button is disabled or dialog is closed
    const isDialogOpen = await employeePage.submitButton
      .isVisible()
      .catch(() => false);
    if (isDialogOpen) {
      const isDisabled = await employeePage.submitButton
        .isDisabled()
        .catch(() => false);
      expect(isDisabled).toBeTruthy();
    }
  });

  test("should search for employee by name", async ({ page }) => {
    // Arrange: Add an employee with unique name
    const timestamp = Date.now();
    const employeeData = {
      firstName: `SearchTest`,
      lastName: `User${timestamp}`,
      pin: "8888",
    };

    await employeePage.addEmployee(employeeData);
    await employeePage.waitForSuccessToast();

    // Wait for dialog to close and table to update
    await page.waitForTimeout(1000);

    // Act: Search for the employee
    await employeePage.searchEmployee(employeeData.lastName);

    // Wait for search to filter results
    await page.waitForTimeout(500);

    // Assert: Employee should be visible in table
    await employeePage.verifyEmployeeExists(
      employeeData.firstName,
      employeeData.lastName
    );
  });

  test("should add employee with specific department", async () => {
    // Arrange: Generate employee data with department
    const timestamp = Date.now();
    const employeeData = {
      firstName: `Department`,
      lastName: `Test${timestamp}`,
      pin: "7777",
      department: "Operations",
    };

    // Act: Add new employee
    await employeePage.addEmployee(employeeData);

    // Assert: Wait for success toast
    const toast = await employeePage.waitForSuccessToast();
    await expect(toast).toContainText(/success/i);

    // Assert: Verify employee appears in table
    const row = await employeePage.findEmployeeInTable(
      employeeData.firstName,
      employeeData.lastName
    );
    await expect(row).toBeVisible();
    await expect(row).toContainText(employeeData.department);
  });

  test("should add inactive employee", async ({ page }) => {
    // Arrange: Generate employee data with inactive status
    const timestamp = Date.now();
    const employeeData = {
      firstName: `Inactive`,
      lastName: `User${timestamp}`,
      pin: "6666",
      isActive: false,
    };

    // Act: Add new employee
    await employeePage.addEmployee(employeeData);

    // Assert: Wait for success toast
    const toast = await employeePage.waitForSuccessToast();
    await expect(toast).toContainText(/success/i);

    // Assert: Verify employee appears in table with inactive status
    const row = await employeePage.findEmployeeInTable(
      employeeData.firstName,
      employeeData.lastName
    );
    await expect(row).toBeVisible();
    await expect(row).toContainText(/inactive/i);
  });
});
