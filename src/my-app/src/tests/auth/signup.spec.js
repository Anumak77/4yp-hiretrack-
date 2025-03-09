import { test, expect } from '@playwright/test';

// Utility to generate a random email
const generateRandomEmail = () => `testuser_${Math.random().toString(36).substring(2, 8)}@example.com`;

test.describe('Signup Page', () => {

  test('should allow users to enter details and sign up with a unique user', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('domcontentloaded');  // Ensure full page load
    await page.waitForSelector('form'); // Ensure form is present

    // Generate a unique user
    const firstName = `User${Math.random().toString(36).substring(2, 6)}`;
    const lastName = `Test${Math.random().toString(36).substring(2, 6)}`;
    const email = generateRandomEmail();
    const password = "Password123!";

    console.log(`🆕 Signing up: ${firstName} ${lastName} | ${email}`);

    // Ensure inputs exist before filling
    await page.waitForSelector('input#first-name', { timeout: 5000 });
    await page.fill('input#first-name', firstName);
    await page.fill('input#last-name', lastName);
    await page.fill('input#email', email);
    await page.fill('input#password', password);

    // Select Job Seeker role
    await page.check('input[name="userType"][value="Job Seeker"]');

    // Select Location (if applicable)
    await page.waitForSelector('select#location', { timeout: 5000 });
    await page.selectOption('select#location', 'United Kingdom');

    // Enter phone number
    await page.fill('input#phone', '1234567890');

    // Click Signup
    await page.click('button.signup-button');

    // ✅ Wait for the redirect
    await page.waitForURL('/login', { timeout: 10000 });

    // ✅ Ensure no error messages
    const errorMessage = await page.locator('.signup-error-text');
    await expect(errorMessage).not.toBeVisible();
  });

});
