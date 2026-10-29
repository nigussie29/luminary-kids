// Focused regression checks for bonus-game answer choices.
// No browser or network needed: evaluate the same pure helper used by the UI.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/app.js'), 'utf8');
const start = source.indexOf('  function miniChoices(answer) {');
const end = source.indexOf('  function miniNewQuestion(kind) {', start);
assert.ok(start >= 0 && end > start, 'miniChoices helper must be present');
const sandbox = { Math };
vm.runInNewContext(source.slice(start, end), sandbox);
const choicesFor = sandbox.miniChoices;
test('four distinct numeric answers, including the correct one, at every boundary', () => {
  for (let answer = 0; answer <= 20; answer++) {
    for (let trial = 0; trial < 40; trial++) {
      const choices = choicesFor(answer);
      assert.equal(choices.length, 4);
      assert.equal(new Set(choices).size, 4);
      assert.ok(choices.includes(answer));
      assert.ok(choices.every(x => Number.isInteger(x) && x >= 0 && x <= 20));
    }
  }
});
test('the correct answer does not always appear in the first position', () => {
  const positions = new Set();
  for (let i = 0; i < 120; i++) positions.add(choicesFor(7).indexOf(7));
  assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
});
