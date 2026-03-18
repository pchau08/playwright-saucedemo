/**
 * AITestHelper
 *
 * A utility class that wraps the OpenAI API to provide AI-augmented
 * testing capabilities. The design principle here is that AI enhances
 * the testing process — generating inputs, suggesting scenarios, and
 * summarizing results — without ever making pass/fail decisions.
 * All assertions remain deterministic and live in the test files.
 *
 * Graceful degradation: if OPENAI_API_KEY is not set, every method
 * returns static fallback data so the test suite continues to run
 * in CI environments that don't have the key configured.
 */

import OpenAI from 'openai';

// Lazy-init the client only if the key is present
const getClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EdgeCaseInputs {
  valid: string[];
  invalid: string[];
  boundary: string[];
}

export interface TestScenario {
  title: string;
  type: 'happy-path' | 'negative' | 'edge-case' | 'boundary';
  description: string;
  expectedOutcome: string;
}

export interface RunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  highlights: string[];
  recommendations: string[];
}

// ─── Fallback Data ─────────────────────────────────────────────────────────

const FALLBACK_EDGE_CASES: EdgeCaseInputs = {
  valid: ['test@example.com', 'user123', 'ValidInput'],
  invalid: ['', ' ', 'a'.repeat(300)],
  boundary: ['a', 'a'.repeat(255), 'a'.repeat(256)],
};

const FALLBACK_SCENARIOS: TestScenario[] = [
  {
    title: 'Happy path with valid credentials',
    type: 'happy-path',
    description: 'Submit form with all required fields populated correctly',
    expectedOutcome: 'Success state or next page displayed',
  },
  {
    title: 'Empty required fields',
    type: 'negative',
    description: 'Submit form without filling any fields',
    expectedOutcome: 'Validation error messages displayed for each required field',
  },
  {
    title: 'Maximum length input',
    type: 'boundary',
    description: 'Fill fields with maximum allowed character count',
    expectedOutcome: 'Input accepted or length limit enforced gracefully',
  },
];

// ─── AITestHelper ──────────────────────────────────────────────────────────

export class AITestHelper {
  private readonly client: OpenAI | null;
  private readonly model = 'gpt-4o-mini';
  private readonly isEnabled: boolean;

  constructor() {
    this.client = getClient();
    this.isEnabled = this.client !== null;

    if (!this.isEnabled) {
      console.info(
        '[AITestHelper] OPENAI_API_KEY not set — running in fallback mode. ' +
        'Set the key to enable dynamic AI-generated test data and scenario suggestions.'
      );
    }
  }

  /**
   * generateEdgeCaseInputs
   *
   * Given a field type (e.g. "email address", "zip code", "username"),
   * asks the model to produce realistic valid, invalid, and boundary inputs.
   *
   * Use this to supplement hardcoded test-data with dynamically discovered
   * edge cases — particularly useful for forms you haven't tested exhaustively.
   */
  async generateEdgeCaseInputs(fieldType: string): Promise<EdgeCaseInputs> {
    if (!this.client) return FALLBACK_EDGE_CASES;

    const prompt = `
You are a QA engineer. Generate test inputs for a "${fieldType}" input field.

Return a JSON object with exactly this shape:
{
  "valid": ["3 realistic valid inputs"],
  "invalid": ["3 inputs that should fail validation"],
  "boundary": ["3 boundary value inputs — e.g. empty, max length, just over max length"]
}

Return only the raw JSON. No markdown, no explanation.
    `.trim();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content ?? '';
      return JSON.parse(content) as EdgeCaseInputs;
    } catch (err) {
      console.warn('[AITestHelper] generateEdgeCaseInputs failed, using fallback:', err);
      return FALLBACK_EDGE_CASES;
    }
  }

  /**
   * suggestTestScenarios
   *
   * Given a plain-English description of a page or feature, returns a list
   * of test scenarios covering happy paths, negative cases, and edge conditions.
   *
   * Useful during test planning — paste in a feature description or acceptance
   * criteria and get an initial scenario list to review and implement.
   */
  async suggestTestScenarios(featureDescription: string): Promise<TestScenario[]> {
    if (!this.client) return FALLBACK_SCENARIOS;

    const prompt = `
You are a senior QA automation engineer. Given the following feature description, 
generate a list of test scenarios.

Feature: ${featureDescription}

Return a JSON array of scenario objects with this shape:
[{
  "title": "short scenario title",
  "type": "happy-path" | "negative" | "edge-case" | "boundary",
  "description": "what the test does",
  "expectedOutcome": "what should happen"
}]

Generate 6–8 scenarios covering different scenario types.
Return only the raw JSON array. No markdown, no explanation.
    `.trim();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content ?? '';
      return JSON.parse(content) as TestScenario[];
    } catch (err) {
      console.warn('[AITestHelper] suggestTestScenarios failed, using fallback:', err);
      return FALLBACK_SCENARIOS;
    }
  }

  /**
   * generateRunSummary
   *
   * Accepts a raw test results object (from Playwright's JSON reporter output
   * or any structured results data) and asks the model to produce a human-
   * readable summary with highlights and recommendations.
   *
   * Designed to be pasted into PR comments, Slack messages, or bug reports.
   */
  async generateRunSummary(rawResults: Record<string, unknown>): Promise<RunSummary> {
    const fallback: RunSummary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 'unknown',
      highlights: ['Test run completed'],
      recommendations: ['Review failed tests in the Allure report'],
    };

    if (!this.client) return fallback;

    const prompt = `
You are a QA engineer writing a test run summary for a PR comment.

Given the following test results:
${JSON.stringify(rawResults, null, 2)}

Return a JSON object with this shape:
{
  "totalTests": number,
  "passed": number,
  "failed": number,
  "skipped": number,
  "duration": "string like '2m 14s'",
  "highlights": ["2–3 bullet points about what passed or failed"],
  "recommendations": ["1–2 follow-up actions if failures exist, otherwise empty array"]
}

Return only the raw JSON. No markdown, no explanation.
    `.trim();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content ?? '';
      return JSON.parse(content) as RunSummary;
    } catch (err) {
      console.warn('[AITestHelper] generateRunSummary failed, using fallback:', err);
      return fallback;
    }
  }

  get enabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton export — avoids creating multiple OpenAI clients in a test run
export const aiHelper = new AITestHelper();
