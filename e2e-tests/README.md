# E2E Testing with Playwright

This directory contains end-to-end tests for the BigCommerce Plugin using Playwright.

## Overview

Playwright is a modern end-to-end testing framework that supports multiple browsers and provides reliable, fast, and cross-platform testing capabilities.

## Test Structure

```
e2e-tests/
├── README.md                 # This file
├── env.example              # Environment variables template
└── bundle-management.spec.ts       # Admin bundle management test
```

## Test Scenarios

### Admin Bundle Management Test (`bundle-management.spec.ts`)
Tests the complete workflow for an admin to manage product bundles:
- Login to BigCommerce admin
- Navigate to Products
- Create and configure bundle settings
- Add bundle contents with quantities
- Save and verify bundle creation
- Edit bundle configuration
- Remove bundle configuration
- Verify bundle removal

## Environment Setup

### Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# BigCommerce Admin Credentials
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password

# Store URL for customer tests
STORE_URL=https://your-store-url.mybigcommerce.com
```

### Copy from Template

```bash
cp e2e-tests/env.example .env
# Then edit .env with your actual credentials
```

## Running Tests

### Local Development

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy and edit the environment template
   cp e2e-tests/env.example .env
   ```

4. **Run E2E tests**:
   ```bash
   # Run all tests (headed mode by default)
   npm run test:e2e
   
   # Run tests in headless mode
   npm run test:e2e:headless
   
   # Run with environment variable (headless)
   HEADLESS=true npm run test:e2e
   ```

## Test Configuration

### Main Configuration (`playwright.config.ts`)
- Tests against external BigCommerce URLs
- No local server startup required
- Supports multiple browsers (Chrome, Firefox, Safari)
- Mobile device testing support

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // Test implementation
  await page.goto('https://example.com');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Using Environment Variables

```typescript
// Access environment variables
await page.goto(process.env.STORE_URL);
await page.fill('#email', process.env.ADMIN_EMAIL);
```

## Browser Support

Tests run against:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Keep tests independent** - each test should be able to run in isolation
3. **Handle async operations** properly with appropriate waits
4. **Use environment variables** for sensitive data like credentials
5. **Test complete user workflows** from start to finish
6. **Verify expected outcomes** at each step

## Troubleshooting

### Common Issues

1. **Authentication failures**: Check environment variables and credentials
2. **Element not found**: Verify selectors and wait for elements to be visible
3. **Network timeouts**: Check internet connection and BigCommerce service status
4. **Browser compatibility**: Test against multiple browsers

### Getting Help

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use environment variables for credentials
3. Test complete user workflows
4. Ensure tests pass in CI pipeline
5. Add test coverage for new features
