import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage encapsulates all interactions with the SauceDemo login screen.
 * Selectors are kept private — callers use semantic action methods only.
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorContainer: Locator;
  private readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorContainer = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async clearAndLogin(username: string, password: string): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.login(username, password);
  }

  async submitEmptyForm(): Promise<void> {
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorContainer).toBeVisible();
    await expect(this.errorContainer).toContainText(message);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorContainer).toBeVisible();
  }

  async expectErrorNotVisible(): Promise<void> {
    await expect(this.errorContainer).not.toBeVisible();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL('/');
  }

  async expectUsernameFieldHighlighted(): Promise<void> {
    await expect(this.usernameInput).toHaveClass(/error/);
  }

  async expectPasswordFieldHighlighted(): Promise<void> {
    await expect(this.passwordInput).toHaveClass(/error/);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getErrorMessage(): Promise<string> {
    return (await this.errorContainer.textContent()) ?? '';
  }
}
