/**
 * Vitest Setup File
 *
 * Global setup and configuration for all test files
 */

import { beforeAll, afterAll, afterEach } from "vitest";

// Setup runs before all tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";

  // Mock console methods in tests to reduce noise
  if (process.env.SILENT_TESTS === "true") {
    global.console = {
      ...console,
      log: () => {},
      debug: () => {},
      info: () => {},
    };
  }
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks to avoid test pollution
  // This is automatically handled by Vitest but explicit for clarity
});

// Cleanup after all tests
afterAll(() => {
  // Perform any necessary cleanup
});
