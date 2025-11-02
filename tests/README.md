# TimeFly Test Suite

Comprehensive unit and integration tests for the TimeFly time tracking application using Vitest.

## Overview

This test suite provides thorough coverage of the TimeFly application, including:

- **Unit Tests**: Testing individual functions and validators in isolation
- **Integration Tests**: Testing services with mocked dependencies
- **Test Utilities**: Helpers, builders, and fixtures for test setup

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── helpers/                    # Test helper functions
│   ├── auth.ts                # Authentication helpers
│   └── supabase.ts            # Supabase test client
├── builders/                   # Test data builders
│   ├── worker.builder.ts      # Worker data builder
│   └── time-registration.builder.ts
├── fixtures/                   # Static test data
│   └── workers.json
├── unit/                       # Unit tests
│   ├── utils/                 # Utility function tests
│   │   ├── password.test.ts
│   │   ├── pagination.test.ts
│   │   └── error-handler.test.ts
│   └── validators/            # Validator tests
│       ├── common.validators.test.ts
│       ├── worker.validators.test.ts
│       └── time-registration.validators.test.ts
└── integration/               # Integration tests
    └── services/              # Service layer tests
        ├── worker.service.test.ts
        ├── time-registration.service.test.ts
        └── dashboard.service.test.ts
```

## Running Tests

### All Tests

```bash
pnpm test
```

### Unit Tests Only

```bash
pnpm test:unit
```

### Integration Tests Only

```bash
pnpm test:integration
```

### Watch Mode (for development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:coverage
```

### Interactive UI

```bash
pnpm test:ui
```

## Test Environment Setup

### Environment Variables

For integration tests that require a real database connection, create a `.env.test` file:

```env
SUPABASE_TEST_URL=your-test-supabase-url
SUPABASE_TEST_ANON_KEY=your-test-anon-key
```

**Note**: Current integration tests use mocks and don't require a real database connection.

### Installing Dependencies

```bash
pnpm install
```

This will install:

- `vitest` - Test framework
- `@vitest/ui` - Interactive test UI
- `@vitest/coverage-v8` - Code coverage
- `@types/bcryptjs` - TypeScript types for bcryptjs

## Test Patterns

### Unit Tests

Unit tests focus on testing individual functions in isolation:

```typescript
import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "@/lib/utils/password";

describe("Password Utilities", () => {
  describe("hashPin", () => {
    it("should hash a PIN", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });
});
```

### Integration Tests

Integration tests test services with mocked dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkerService } from '@/lib/services/worker.service';

describe('WorkerService Integration Tests', () => {
  let service: WorkerService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new WorkerService(mockSupabase);
  });

  it('should list workers', async () => {
    // Setup mock
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [...],
        error: null,
      }),
    });

    // Execute
    const result = await service.listWorkers({});

    // Assert
    expect(result.workers).toHaveLength(2);
  });
});
```

### Using Test Builders

Test builders provide a fluent API for creating test data:

```typescript
import { aWorker } from "@/tests/builders/worker.builder";

const worker = aWorker()
  .withName("Jan", "Kowalski")
  .withPin("1234")
  .withDepartment("IT")
  .active()
  .build();
```

```typescript
import { aTimeRegistration } from "@/tests/builders/time-registration.builder";

const registration = aTimeRegistration()
  .forWorker("worker-id")
  .checkInHoursAgo(8)
  .withDuration(8)
  .completed()
  .build();
```

## Coverage Goals

The test suite aims for:

- **Overall**: 80%+ code coverage
- **Utils**: 80%+ coverage
- **Validators**: 100% coverage
- **Services**: 80%+ coverage

View current coverage with:

```bash
pnpm test:coverage
```

Coverage reports are generated in:

- `coverage/` directory (HTML report)
- Terminal output (text summary)

## Writing New Tests

### Adding a Unit Test

1. Create a test file in `tests/unit/` matching the source file structure
2. Import the functions to test
3. Write test cases using `describe` and `it` blocks
4. Follow the Arrange-Act-Assert pattern

### Adding an Integration Test

1. Create a test file in `tests/integration/services/`
2. Mock the Supabase client
3. Test the service methods with various scenarios
4. Verify both success and error cases

### Test Naming Conventions

- Test files: `*.test.ts`
- Describe blocks: Use descriptive names for the unit under test
- It blocks: Start with "should" and describe expected behavior

Example:

```typescript
describe("WorkerService", () => {
  describe("createWorker", () => {
    it("should create a worker with hashed PIN", async () => {
      // test implementation
    });

    it("should allow creating workers with the same PIN", async () => {
      // test implementation - multiple workers can share PINs
    });
  });
});
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Don't hit real databases in unit tests
5. **Test Edge Cases**: Cover error paths and boundary conditions
6. **Keep Tests Fast**: Unit tests should run in milliseconds
7. **Use Builders**: Leverage test builders for complex data setup
8. **Follow the Rules**: Refer to `.cursor/rules/vitest-unit-testing.mdc` for guidelines

## Debugging Tests

### Run a Single Test File

```bash
pnpm test tests/unit/utils/password.test.ts
```

### Run Tests Matching a Pattern

```bash
pnpm test -t "hashPin"
```

### Debug in VS Code

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## Troubleshooting

### Tests Not Running

1. Ensure dependencies are installed: `pnpm install`
2. Check that test files match the pattern: `*.test.ts` or `*.spec.ts`
3. Verify the file is in the correct directory

### Import Errors

1. Check that path aliases are configured in `vitest.config.ts`
2. Ensure TypeScript paths match Vitest resolve aliases

### Mock Issues

1. Verify mocks are created in `beforeEach` hooks
2. Check that mock implementations return the expected structure
3. Use `vi.clearAllMocks()` between tests if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Test Plan](../.ai/comprehensive-test-plan.md)
- [Vitest Rules](../.cursor/rules/vitest-unit-testing.mdc)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `pnpm test`
3. Maintain coverage above 80%: `pnpm test:coverage`
4. Follow existing test patterns and conventions
5. Update this README if adding new test categories

---

**Last Updated**: October 26, 2025  
**Test Framework**: Vitest 2.2.1  
**Coverage Target**: 80%+
