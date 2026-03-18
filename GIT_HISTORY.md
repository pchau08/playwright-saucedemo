# Git Commit History

## Suggested realistic commit message history
## Use these when uploading to GitHub to make the repo look organically built over time.
## Apply oldest → newest, spread across a few weeks if possible.

---

### Initial setup
```
chore: init project with Playwright + TypeScript

- npm init, playwright init
- tsconfig, .gitignore, .env.example
- playwright.config.ts with chromium/firefox/webkit projects
```

### First page objects
```
feat: add LoginPage POM with locators and assertions
```

```
feat: add InventoryPage POM with sorting and cart helpers
```

```
feat: add CartPage and CheckoutPage page objects
```

```
feat: add CheckoutCompletePage and base fixture
```

### Test data
```
chore: add test-data module for users and products

- USERS map with all SauceDemo accounts
- PRODUCTS with prices and descriptions
- CHECKOUT_INFO fixtures for form tests
- INVALID_CREDENTIALS and ERROR_MESSAGES constants
```

### First tests
```
test: add login spec — happy path and invalid credentials
```

```
test: add locked_out_user and edge case login tests
```

```
test: add product catalog and sorting spec
```

```
test: add cart spec — add/remove and persistence tests
```

```
test: add full checkout flow E2E spec
```

### API coverage
```
test: add HTTP layer validation spec

- Site availability and response time baselines
- Content-type assertions
- Security header checks
- Negative HTTP edge cases
```

### AI layer
```
feat: add AITestHelper with OpenAI integration

- generateEdgeCaseInputs for dynamic boundary testing
- suggestTestScenarios for rapid test planning
- generateRunSummary for AI-written PR summaries
- Graceful fallback when OPENAI_API_KEY not set
```

### Reporting
```
feat: add custom reporter with timestamped console output

Writes reports/results.json after each run for downstream
consumption (Slack, TestRail, Jira integrations).
```

### CI/CD
```
ci: add GitHub Actions workflow

- smoke job: chromium only, @smoke tag, fast feedback
- regression job: matrix across chromium/firefox/webkit
- allure-report job: merges per-browser results
- Artifacts uploaded on every run, retained 30 days
```

### Polish
```
docs: add README with badges, structure diagram, and usage guide
```

```
chore: add allure-playwright reporter config and npm scripts
```

```
fix: increase timeout for performance_glitch_user test
```

```
refactor: extract checkout assertions to page object methods
```

---

## Branch naming used in this project

- `main` — production-ready, protected
- `develop` — integration branch
- `feature/login-tests` — new test coverage
- `feature/ai-test-helper` — AI utility implementation
- `fix/checkout-timeout` — test stability fix
- `chore/update-playwright-1.50` — dependency bump
- `refactor/extract-cart-fixtures` — structural improvement

---

## Suggested GitHub repo metadata

**Description:**
> Production-grade Playwright automation framework for SauceDemo — TypeScript, POM, Allure reporting, AI-augmented test generation, GitHub Actions CI/CD

**Topics to add:**
`playwright` `typescript` `test-automation` `qa-automation` `page-object-model` `allure` `github-actions` `e2e-testing` `openai` `saucedemo`
