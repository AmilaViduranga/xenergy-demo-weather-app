import { expect, test } from '@playwright/test';

async function mockFirebaseAuthFailure(page: import('@playwright/test').Page, message = 'INVALID_PASSWORD') {
  await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 400,
          message,
          errors: [{ message, domain: 'global', reason: 'invalid' }],
        },
      }),
    });
  });
}

test.describe('Auth pages', () => {
  test('shows the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('go-register')).toBeVisible();
  });

  test('shows the register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.getByTestId('register-email')).toBeVisible();
    await expect(page.getByTestId('go-login')).toBeVisible();
  });

  test('navigates between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('go-register').click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByTestId('register-page')).toBeVisible();

    await page.getByTestId('go-login').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  test('shows an error when login credentials are rejected', async ({ page }) => {
    await mockFirebaseAuthFailure(page);
    await page.goto('/login');
    await page.getByTestId('login-email').fill('demo@example.com');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('shows an error when registration is rejected', async ({ page }) => {
    await mockFirebaseAuthFailure(page, 'EMAIL_EXISTS');
    await page.goto('/register');
    await page.getByTestId('register-email').fill('taken@example.com');
    await page.getByTestId('register-password').fill('secret1');
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('register-error')).toBeVisible();
  });
});
