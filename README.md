# 🎭 Playwright Automation Framework — SauceDemo

![Playwright](https://img.shields.io/badge/Playwright-1.50.x-45ba4b?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088ff?logo=github-actions&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-2.x-orange?logo=qameta&logoColor=white)
![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-grade end-to-end test automation framework built with Playwright and TypeScript, targeting [SauceDemo](https://www.saucedemo.com) — a public eCommerce demo site. This project demonstrates real-world QA engineering practices including Page Object Model architecture, AI-augmented test generation, multi-browser execution, and automated CI/CD reporting.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [AI Integration](#ai-integration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reporting](#reporting)
- [Contributing](#contributing)

---

## Overview

This framework covers the core user journeys of the SauceDemo eCommerce application:

- **Authentication** — valid login, invalid credentials, locked-out user, edge cases
- **Product Catalog** — sorting, filtering, product detail validation
- **Shopping Cart** — add/remove items, cart persistence, badge counts
- **Checkout Flow** — full order completion, form validation, order confirmation
- **API Layer** — endpoint validation where applicable
- **AI-Augmented Testing** — dynamic test data generation and scenario suggestion via OpenAI

The test suite is designed to run in CI on every push and PR, with smoke vs. full regression separation and Allure report artifacts published automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Test Runner | Playwright 1.50.x |
| Language | TypeScript 5.x |
| Architecture | Page Object Model (POM) |
| BDD Layer | Playwright Test (native) |
| API Testing | Playwright APIRequestContext |
| AI Integration | OpenAI API (gpt-4o-mini) |
| Reporting | Allure 2.x + Custom Reporter |
| CI/CD | GitHub Actions |
| Node Version | 20.x LTS |

---

## Project Structure

```
playwright-saucedemo/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions pipeline
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts         # Extended Playwright fixtures
│   ├── helpers/
│   │   ├── ai-test-helper.ts       # OpenAI-powered test utilities
│   │   └── api-helper.ts           # API request utilities
│   ├── pages/
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── checkout-complete.page.ts
│   └── test-data/
│       ├── users.ts                # User credentials and test accounts
│       └── products.ts             # Product data and expectations
├── tests/
│   ├── auth/
│   │   └── login.spec.ts
│   ├── e2e/
│   │   ├── checkout-flow.spec.ts
│   │   └── cart.spec.ts
│   ├── catalog/
│   │   └── product-sorting.spec.ts
│   └── api/
│       └── api-validation.spec.ts
├── reports/
│   └── .gitkeep
├── allure-results/
│   └── .gitkeep
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-saucedemo.git
cd playwright-saucedemo

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Copy environment variables
cp .env.example .env
```

Edit `.env` with your values. At minimum, `BASE_URL` is required. `OPENAI_API_KEY` is only needed if you want the AI helper features active.

---

## Running Tests

### Run all tests (all browsers)

```bash
npm test
```

### Run smoke tests only

```bash
npm run test:smoke
```

### Run full regression

```bash
npm run test:regression
```

### Run a specific spec file

```bash
npx playwright test tests/auth/login.spec.ts
```

### Run in headed mode (useful for debugging)

```bash
npx playwright test --headed
```

### Run on a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run with UI mode (interactive explorer)

```bash
npx playwright test --ui
```

### Generate and open Allure report

```bash
npm run allure:generate
npm run allure:open
```

---

## AI Integration

This framework includes an `AITestHelper` utility (`src/helpers/ai-test-helper.ts`) that integrates with the OpenAI API to augment the test suite with intelligent capabilities:

**1. Dynamic Edge Case Generation**
Rather than hardcoding boundary-value inputs, the helper queries the model to generate realistic edge cases for a given field type (e.g., "email", "zip code", "name"). This surfaces test scenarios that manual analysis might miss.

**2. Scenario Suggestion**
Given a plain-English description of a page or feature, the helper returns a list of test scenarios covering happy paths, negative cases, and edge conditions. Useful for rapid test planning on new features.

**3. Post-Run Summaries**
After a test run, the helper can consume a results JSON and generate a human-readable summary describing pass/fail counts, flaky areas, and recommended follow-up. Suitable for dropping into a Slack message or PR comment.

**Configuration:**
Set `OPENAI_API_KEY` in your `.env` file. If the key is absent, the helper degrades gracefully and returns static fallback data so tests continue to run in CI without requiring the API.

**Why this approach:**
The AI layer is intentionally kept as a utility class rather than embedded in test assertions. This keeps tests deterministic and reproducible — the AI is used for *generating inputs and documentation*, not for making pass/fail decisions.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main` and `develop`.

**Jobs:**

| Job | Trigger | Browsers | Description |
|---|---|---|---|
| `smoke` | push, PR | chromium | Fast sanity check — critical path only |
| `regression` | push to main, PR | chromium, firefox, webkit | Full suite across all browsers |

**Artifacts:**
- Allure report uploaded as a downloadable artifact on every run
- Screenshots automatically captured on test failure
- Test results JSON retained for 30 days

**Environment secrets required:**
- `BASE_URL` — defaults to `https://www.saucedemo.com`
- `OPENAI_API_KEY` — optional, for AI helper features

---

## Reporting

### Allure Report

After running tests locally:

```bash
npm run allure:generate  # converts allure-results/ to allure-report/
npm run allure:open      # opens the report in your browser
```

The Allure report includes:
- Test execution timeline
- Pass/fail/skip breakdown by suite
- Screenshots attached on failure
- Full step-by-step log per test
- Environment metadata (OS, browser, Node version)

### Custom Reporter

A lightweight custom reporter (`src/helpers/custom-reporter.ts`) logs timestamped test results to the console and writes a `reports/results.json` summary file. This makes it easy to pipe results into other systems (Slack webhooks, TestRail, Jira, etc.).

---

## Sample Report Output

```
[2026-03-15 09:14:32] ✅ PASSED  login › should login with valid credentials            (1.2s)
[2026-03-15 09:14:34] ✅ PASSED  login › should show error for invalid password          (0.8s)
[2026-03-15 09:14:35] ✅ PASSED  login › should block locked_out_user                   (0.6s)
[2026-03-15 09:14:38] ✅ PASSED  checkout › should complete full purchase flow           (4.1s)
[2026-03-15 09:14:40] ❌ FAILED  checkout › should show error for missing zip code       (1.0s)

Run Summary: 24 passed, 1 failed, 0 skipped — 38.4s total
```

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Follow the existing code style (ESLint + Prettier config)
4. Write tests for any new page objects or helpers
5. Submit a PR with a clear description of the change

Branch naming conventions used in this project:
- `feature/` — new test coverage or utilities
- `fix/` — bug fixes in existing tests or helpers
- `chore/` — config updates, dependency bumps, CI changes
- `refactor/` — structural improvements without behavior change

---

## License

MIT
