import type {
  Reporter,
  TestCase,
  TestResult,
  FullConfig,
  Suite,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface ResultRecord {
  title: string;
  status: string;
  duration: number;
  timestamp: string;
  error?: string;
}

/**
 * CustomReporter
 *
 * Lightweight reporter that:
 * - Logs timestamped pass/fail lines to stdout
 * - Writes a JSON summary to reports/results.json after the run
 *
 * Designed to be simple — heavy reporting is handled by Allure.
 * The JSON output makes it easy to pipe results elsewhere (Slack, TestRail, etc.).
 */
class CustomReporter implements Reporter {
  private results: ResultRecord[] = [];
  private startTime = 0;

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = Date.now();
    console.log('\n──────────────────────────────────────────');
    console.log('  Playwright Test Run Started');
    console.log(`  ${new Date().toISOString()}`);
    console.log('──────────────────────────────────────────\n');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const status = result.status === 'passed' ? '✅ PASSED ' : result.status === 'failed' ? '❌ FAILED ' : '⏭  SKIPPED';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const duration = `${(result.duration / 1000).toFixed(1)}s`;
    const title = test.titlePath().slice(1).join(' › ');

    console.log(`[${timestamp}] ${status}  ${title.padEnd(60)} (${duration})`);

    this.results.push({
      title,
      status: result.status,
      duration: result.duration,
      timestamp,
      error: result.error?.message,
    });
  }

  onEnd(result: FullResult): void {
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;

    console.log('\n──────────────────────────────────────────');
    console.log(`  Run Summary: ${passed} passed, ${failed} failed, ${skipped} skipped — ${totalDuration}s total`);
    console.log(`  Overall Status: ${result.status.toUpperCase()}`);
    console.log('──────────────────────────────────────────\n');

    // Write JSON summary for downstream consumption
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const summary = {
      runAt: new Date().toISOString(),
      status: result.status,
      total: this.results.length,
      passed,
      failed,
      skipped,
      durationSeconds: parseFloat(totalDuration),
      tests: this.results,
    };

    fs.writeFileSync(
      path.join(reportsDir, 'results.json'),
      JSON.stringify(summary, null, 2),
      'utf-8'
    );
  }
}

export default CustomReporter;
