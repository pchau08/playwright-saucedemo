/**
 * SauceDemo ships with a fixed set of test accounts.
 * These are public credentials documented on the login page itself.
 */

export interface UserCredentials {
  username: string;
  password: string;
}

const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: PASSWORD,
  },
  lockedOut: {
    username: process.env.LOCKED_OUT_USER ?? 'locked_out_user',
    password: PASSWORD,
  },
  problem: {
    username: process.env.PROBLEM_USER ?? 'problem_user',
    password: PASSWORD,
  },
  performanceGlitch: {
    username: process.env.PERFORMANCE_GLITCH_USER ?? 'performance_glitch_user',
    password: PASSWORD,
  },
  error: {
    username: process.env.ERROR_USER ?? 'error_user',
    password: PASSWORD,
  },
  visual: {
    username: process.env.VISUAL_USER ?? 'visual_user',
    password: PASSWORD,
  },
} as const satisfies Record<string, UserCredentials>;

export const INVALID_CREDENTIALS = {
  wrongPassword: { username: 'standard_user', password: 'wrong_password' },
  wrongUsername: { username: 'nonexistent_user', password: PASSWORD },
  emptyBoth: { username: '', password: '' },
  emptyUsername: { username: '', password: PASSWORD },
  emptyPassword: { username: 'standard_user', password: '' },
  sqlInjection: { username: "' OR '1'='1", password: "' OR '1'='1" },
  xssAttempt: { username: '<script>alert(1)</script>', password: PASSWORD },
  longString: { username: 'a'.repeat(256), password: 'b'.repeat(256) },
  specialChars: { username: '!@#$%^&*()', password: '!@#$%^&*()' },
  whitespaceOnly: { username: '   ', password: '   ' },
} as const;

export const ERROR_MESSAGES = {
  emptyUsername: 'Epic sadface: Username is required',
  emptyPassword: 'Epic sadface: Password is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
} as const;
