const http = require('http');

const BASE = process.env.BASE_URL || 'http://localhost:5000/api';
const PASS = [];
const FAIL = [];

async function hit(method, path, label) {
  return new Promise(resolve => {
    const req = http.request(`${BASE}${path}`, { method, timeout: 10000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const ok = res.statusCode >= 200 && res.statusCode < 400;
        (ok ? PASS : FAIL).push({ label, status: res.statusCode, path: `${method} ${path}` });
        resolve();
      });
    });
    req.on('error', e => {
      FAIL.push({ label, error: e.message, path: `${method} ${path}` });
      resolve();
    });
    req.on('timeout', () => { req.destroy(); FAIL.push({ label, error: 'timeout', path: `${method} ${path}` }); resolve(); });
    req.end();
  });
}

async function main() {
  console.log('Running API smoke tests...\n');

  await hit('GET', '/teams?limit=5', 'GET /teams');
  await hit('GET', '/categories/leagues?limit=5', 'GET /leagues');
  await hit('GET', '/matches?limit=5', 'GET /matches');
  await hit('GET', '/players?limit=5', 'GET /players');

  console.log(`Results: ${PASS.length} passed, ${FAIL.length} failed\n`);
  if (PASS.length) console.log('PASSED:\n' + PASS.map(p => `  ✓ ${p.label} (${p.status})`).join('\n'));
  if (FAIL.length) console.log('\nFAILED:\n' + FAIL.map(f => `  ✗ ${f.label} — ${f.error || f.status}`).join('\n'));
  console.log();
  process.exit(FAIL.length ? 1 : 0);
}

main();
