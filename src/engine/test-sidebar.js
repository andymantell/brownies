import { getAllTests, runTest } from './testing.js';

// The test sidebar: a peeling corner you click to open a panel listing every test,
// with buttons to run them and a tick or cross for each check.

export function createTestSidebar() {
  loadStyles();

  const peel = element('button', 'test-peel', '🧪 Tests');
  peel.title = 'Open the tests';

  const sidebar = element('aside', 'test-sidebar');
  const header = element('header', 'test-header');
  const heading = element('h2', '', '🧪 Our tests');
  const closeButton = element('button', 'test-close', '✕');
  closeButton.title = 'Close the tests';
  header.append(heading, closeButton);

  const runAllButton = element('button', 'test-run-all', '▶ Run all the tests');
  const summary = element('p', 'test-summary', 'Press a ▶ button to run a test.');
  const list = element('div', 'test-list');
  sidebar.append(header, runAllButton, summary, list);

  document.body.append(peel, sidebar);

  peel.addEventListener('click', () => document.body.classList.add('tests-open'));
  closeButton.addEventListener('click', () => document.body.classList.remove('tests-open'));

  // One card per test.
  const cards = getAllTests().map((oneTest) => {
    const card = element('section', 'test-card');
    const top = element('div', 'test-card-top');
    const name = element('h3', '', oneTest.name);
    const status = element('span', 'test-status', 'Not run yet');
    top.append(name, status);

    const description = element('p', 'test-description', oneTest.description);
    const runButton = element('button', 'test-run', '▶ Run');
    const checks = element('ul', 'test-checks');
    card.append(top, description, runButton, checks);
    list.append(card);

    return { oneTest, card, status, runButton, checks };
  });

  let busy = false;

  async function run(someCards) {
    if (busy) return;
    busy = true;
    sidebar.classList.add('busy');

    let passedCount = 0;
    for (const card of someCards) {
      const passed = await runCard(card);
      if (passed) passedCount++;
    }
    summary.textContent =
      passedCount === someCards.length
        ? `🎉 ${passedCount} of ${someCards.length} passed!`
        : `${passedCount} of ${someCards.length} passed. Let's find out why!`;

    sidebar.classList.remove('busy');
    busy = false;
  }

  async function runCard({ oneTest, card, status, checks }) {
    setStatus(card, status, 'running', 'Running…');
    checks.innerHTML = '';
    summary.textContent = `Running "${oneTest.name}"…`;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const results = await runTest(oneTest);

    for (const result of results) {
      const line = element('li', result.passed ? 'passed' : 'failed');
      line.append(element('span', 'test-mark', result.passed ? '✅' : '❌'), element('span', '', result.sentence));
      checks.append(line);
    }

    const passed = results.every((result) => result.passed);
    setStatus(card, status, passed ? 'passed' : 'failed', passed ? 'Passed' : 'Failed');
    return passed;
  }

  runAllButton.addEventListener('click', () => run(cards));
  for (const card of cards) {
    card.runButton.addEventListener('click', () => run([card]));
  }
}

function setStatus(card, status, state, text) {
  card.dataset.state = state;
  status.textContent = text;
}

function element(tag, className, text) {
  const thing = document.createElement(tag);
  if (className) thing.className = className;
  if (text) thing.textContent = text;
  return thing;
}

function loadStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./test-sidebar.css', import.meta.url).href;
  document.head.append(link);
}
