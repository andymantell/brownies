// Runs the game's tests (src/tests.js) in a headless browser, for the GitHub Actions pipeline.
// It clicks the same "Run all the tests" button that you'd click in the sidebar.
//
// Usage (with the game running, e.g. `python3 serve.py`):
//   node tools/run-tests.mjs [url]

import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:8000/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })

const pageErrors = []
page.on('pageerror', (error) => {
  pageErrors.push(error.message)
})
page.on('console', (message) => {
  if (message.type() === 'error') {
    pageErrors.push(message.text())
  }
})

await page.goto(url)
await page.click('.test-peel')
await page.click('.test-run-all')

// Wait until every test card says it passed or failed.
function allTestsHaveFinished() {
  const cards = [...document.querySelectorAll('.test-card')]
  return cards.every((card) => {
    return card.dataset.state === 'passed' || card.dataset.state === 'failed'
  })
}
await page.waitForFunction(allTestsHaveFinished, null, { timeout: 120_000 })

// Read the name, result and checks from each test card.
function readTestCards(cards) {
  return cards.map((card) => {
    const checkLines = [...card.querySelectorAll('.test-checks li')]
    return {
      name: card.querySelector('h3').textContent,
      passed: card.dataset.state === 'passed',
      checks: checkLines.map((line) => line.textContent),
    }
  })
}
const results = await page.$$eval('.test-card', readTestCards)
await browser.close()

for (const result of results) {
  let label = 'FAIL'
  if (result.passed) {
    label = 'PASS'
  }
  console.log(`${label}  ${result.name}`)

  for (const check of result.checks) {
    console.log(`        ${check}`)
  }
}

for (const error of pageErrors) {
  console.log(`ERROR ${error}`)
}

const failed = results.filter((result) => !result.passed).length
const passed = results.length - failed
console.log(`\n${passed} of ${results.length} tests passed`)

if (failed > 0 || pageErrors.length > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
