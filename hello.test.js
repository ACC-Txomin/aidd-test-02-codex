const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

test('muestra el saludo esperado', () => {
  const result = spawnSync(process.execPath, ['hello.js'], {
    cwd: __dirname,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, 'Hola desde SolidKey AIDD\n');
});
