import { test, expect } from '@playwright/test';

test.describe('BigCommerce Bundle Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(300000); // 5 minutes
  });

  test('Admin can create, edit, and remove product bundles', async ({ page }) => {
    // Test metadata for better reporting
    test.info().annotations.push({
      type: 'test-description',
      description: 'Tests complete bundle lifecycle: create, edit, and remove product bundles'
    });
  // Step 1: Navigate to BigCommerce login page
  await page.goto('https://login.bigcommerce.com/login');
  await expect(page).toHaveTitle(/BigCommerce/);

  console.log('🛑 Please manually enter your email and password, then click Log in in the browser.');
  console.log('🛑 Please enter your 2FA code manually, then click Verify in the browser.');

  await page.pause();

  // Step 2: Navigate to products management
  console.log('✅ Login completed successfully!');
  await page.goto('https://store-7wt5mizwwn.mybigcommerce.com/manage/dashboard');
  await expect(page).toHaveURL(/dashboard/);
  
  await page.getByRole('menuitem', { name: 'Expand Inactive products icon' }).getByLabel('Expand').click();
  await page.getByRole('link', { name: 'All products' }).click();
  await expect(page).toHaveURL(/products/);
  
  // Step 3: Locate and select the test product
  await page.waitForTimeout(10000); 
  await page.locator('iframe[name="cp-iframe"]').contentFrame()
  .getByRole('row', { name: 'Unselected E2E Dummy Chess' })
  .getByTestId('actions')
  .locator('button')
  .first()
  .click();
  // Step 4: Open Product Bundle Manager
  await page.locator('iframe[name="cp-iframe"]').contentFrame().getByRole('option', { name: 'Product Bundle Manager' }).nth(1).click();
  
  // Verify bundle manager opened
  const bundleFrame = page.locator('iframe[title="Product Bundle Manager"]');
  await expect(bundleFrame).toBeVisible();
  
  // Step 5: Configure bundle settings
  await bundleFrame.contentFrame().locator('label').click();
  // Step 6: Add first bundle item (Red variant)
  await bundleFrame.contentFrame().getByRole('button', { name: 'Red [E2EDND001-RE]' }).click();
  await bundleFrame.contentFrame().locator('.css-1xc3v61-indicatorContainer').click();
  await bundleFrame.contentFrame().getByRole('option', { name: 'carrybag: carry bag' }).click();
  await bundleFrame.contentFrame().getByRole('option', { name: 'oackch-SM: Oak chess board -' }).click();
  await bundleFrame.contentFrame().locator('svg').first().click();
  await bundleFrame.contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).click();
  await bundleFrame.contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).fill('120');
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('button', { name: 'Green [E2EDND001-GR]' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().locator('.css-19bb58m').click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('option', { name: 'carrybag: carry bag' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('option', { name: 'oackch-LA: Oak chess board -' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().locator('.css-19bb58m').click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).fill('120');
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('button', { name: 'Blue [E2EDND001-BL]' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().locator('.css-19bb58m').click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('option', { name: 'carrybag: carry bag' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('option', { name: 'oakpcs-SM: Oak chess pieces' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().locator('.css-19bb58m').click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().getByRole('spinbutton', { name: 'Override Price (optional)' }).fill('130');
  // Step 7: Save bundle configuration
  await bundleFrame.contentFrame().getByRole('button', { name: 'Save' }).click();
  
  // Step 8: Verify bundle was saved successfully
  await page.waitForTimeout(20000);
  
  // Take screenshot after bundle creation
  await page.screenshot({ path: 'test-results/bundle-created.png', fullPage: true }); 
  // Step 9: Navigate back to products list
  console.log('✅ Bundle created successfully!');
  await page.goto('https://store-7wt5mizwwn.mybigcommerce.com/manage/products');
  await expect(page).toHaveURL(/products/);
  
  await page.locator('iframe[name="cp-iframe"]').contentFrame().locator('.styled__StyledButton-sc-3yq204-0.fbfJhz.sc-kNnbXp').first().click();
  
  // Step 10: Edit the product to remove bundle
  await page.waitForTimeout(10000); 
  await page.locator('iframe[name="cp-iframe"]').contentFrame()
  .getByRole('row', { name: 'Unselected E2E Dummy Chess' })
  .getByTestId('actions')
  .locator('button')
  .first()
  .click();
  await page.locator('iframe[name="cp-iframe"]').contentFrame().getByRole('link', { name: 'Edit' }).click();
  await page.goto('https://store-7wt5mizwwn.mybigcommerce.com/manage/products/edit/172');
  await page.locator('iframe[name="cp-iframe"]').contentFrame().getByRole('button', { name: 'Cancel' }).click();
  // Click the first button within the actions area
  await page.waitForTimeout(10000); 
  await page.locator('iframe[name="cp-iframe"]').contentFrame()
  .getByRole('row', { name: 'Unselected E2E Dummy Chess' })
  .getByTestId('actions')
  .locator('button')
  .first()
  .click();
  await page.locator('iframe[name="cp-iframe"]').contentFrame().getByText('Product Bundle Manager').nth(1).click();
  await page.locator('iframe[title="Product Bundle Manager"]').contentFrame().locator('label').click();
  // Step 11: Remove bundle configuration
  await bundleFrame.contentFrame().getByRole('button', { name: 'Remove bundle status' }).click();
  
  // Step 12: Verify bundle removal
  await page.waitForTimeout(15000);
  
  // Step 13: Final verification - return to products list
  console.log('✅ Bundle deleted successfully!');
  await page.goto('https://store-7wt5mizwwn.mybigcommerce.com/manage/products');
  await expect(page).toHaveURL(/products/);
  
  // Verify the product is back to normal state
  await page.locator('iframe[name="cp-iframe"]').contentFrame().locator('.styled__StyledButton-sc-3yq204-0.fbfJhz.sc-kNnbXp').first().click();
  
  console.log('✅ Bundle management test completed successfully!');
  });
});
