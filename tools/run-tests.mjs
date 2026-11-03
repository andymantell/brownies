// Runs the game's tests (src/tests.js) in a headless browser, for the GitHub Actions pipeline.
// It clicks the same "Run all the tests" button that you'd click in the sidebar.
//
// Usage (with the game running, e.g. `python3 serve.py`):
//   node tools/run-tests.mjs [url]

import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:8000/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') pageErrors.push(message.text());
});

await page.goto(url);
await page.click('.test-peel');
await page.click('.test-run-all');
await page.waitForFunction(
  () => [...document.querySelectorAll('.test-card')].every((card) => ['passed', 'failed'].includes(card.dataset.state)),
  null,
  { timeout: 120_000 },
);

const results = await page.$$eval('.test-card', (cards) =>
  cards.map((card) => ({
    name: card.querySelector('h3').textContent,
    passed: card.dataset.state === 'passed',
    checks: [...card.querySelectorAll('.test-checks li')].map((line) => line.textContent),
  })),
);
await browser.close();

for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.name}`);
  for (const check of result.checks) console.log(`        ${check}`);
}
for (const error of pageErrors) console.log(`ERROR ${error}`);

const failed = results.filter((result) => !result.passed).length;
console.log(`\n${results.length - failed} of ${results.length} tests passed`);
process.exit(failed > 0 || pageErrors.length > 0 ? 1 : 0);
