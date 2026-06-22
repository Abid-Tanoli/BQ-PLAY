/**
 * Scoring Flow Tests — tests 3 critical scoring flows via the HTTP API.
 *
 * Prerequisites:
 *   - Backend server running on localhost:5000
 *   - At least 1 Team and 2 Players exist in the database
 *
 * Usage:  node scripts/scoring-flow-test.cjs
 *
 * Environment:
 *   BASE_URL   (default http://localhost:5000/api)
 *   MATCH_ID   (optional — creates a new match if omitted)
 *   TEAM_ID    (optional — uses first team if omitted)
 *   ADMIN_TOKEN (optional — logs in an admin if omitted)
 */

const http = require('http');
const assert = require('assert');

const BASE = process.env.BASE_URL || 'http://localhost:5000/api';
let MATCH_ID = process.env.MATCH_ID || null;
let TOKEN = process.env.ADMIN_TOKEN || null;

// ── Helpers ────────────────────────────────────────────────────────

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const r = http.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString()); } catch { data = null; }
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function login() {
  const { data } = await req('POST', '/admin/login', {
    email: process.env.ADMIN_EMAIL || 'admin@test.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  });
  if (data?.token) TOKEN = data.token;
  if (!TOKEN) throw new Error('Could not obtain admin token — set ADMIN_TOKEN / ADMIN_EMAIL + ADMIN_PASSWORD');
}

async function getFirstTeam() {
  const { data } = await req('GET', '/teams?limit=1', null, TOKEN);
  const team = data?.teams?.[0] || data?.[0];
  if (!team) throw new Error('No team found — create one first or set TEAM_ID');
  return team;
}

async function getFirstPlayers(team, count = 2) {
  const { data } = await req('GET', `/teams/${team._id || team}`, null, TOKEN);
  const players = data?.team?.players || data?.players || [];
  if (players.length < count) throw new Error(`Team has ${players.length} players, need ${count}`);
  return players.slice(0, count);
}

async function createMatch(teamId, players) {
  const { data } = await req('POST', '/matches', {
    title: `Test Match ${Date.now()}`,
    venue: 'Test Ground',
    matchType: 'T20',
    matchCategory: 'Other',
    category: 'Other',
    teams: [teamId, teamId],
    startAt: new Date().toISOString(),
  }, TOKEN);
  const match = data?.match || data;
  if (!match?._id) throw new Error('Failed to create match: ' + JSON.stringify(data));
  console.log(`  ✓ Created match ${match._id}`);

  // Set openers
  await req('PUT', `/matches/${match._id}/openers`, {
    inningsIndex: 0,
    batsman1Id: players[0],
    batsman2Id: players[1],
  }, TOKEN);

  return match;
}

// ── Test Flows ─────────────────────────────────────────────────────

async function flow1_recordRuns(ininningsIndex = 0) {
  console.log('\n─── Flow 1: Record a normal run (single) ───');
  const res = await req('POST', `/matches/${MATCH_ID}/score`, {
    inningsIndex,
    runs: 1,
    isWide: false,
    isNoBall: false,
    isWicket: false,
    batsmanOnStrikeId: process.env.BATSMAN1_ID,
    batsmanNonStrikeId: process.env.BATSMAN2_ID,
    bowlerId: process.env.BOWLER_ID,
  }, TOKEN);

  assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  assert.ok(res.data?.match, 'Response missing match data');
  const innings = res.data.match.innings?.[ininningsIndex];
  assert.ok(innings, 'Response missing innings data');
  assert.strictEqual(innings.runs, 1, `Expected runs=1, got ${innings.runs}`);
  assert.strictEqual(innings.wickets, 0, `Expected wickets=0, got ${innings.wickets}`);
  assert.strictEqual(innings.balls, 1, `Expected balls=1, got ${innings.balls}`);
  assert.strictEqual(innings.batting?.[0]?.runs, 1, `Expected batsman runs=1, got ${innings.batting?.[0]?.runs}`);
  console.log('  ✓ Single recorded: runs=1 balls=1 wickets=0');
}

async function flow2_recordWicket(ininningsIndex = 0) {
  console.log('\n─── Flow 2: Record a wicket ───');
  const res = await req('POST', `/matches/${MATCH_ID}/score`, {
    inningsIndex,
    runs: 0,
    isWide: false,
    isNoBall: false,
    isWicket: true,
    wicketType: 'bowled',
    dismissedPlayerId: process.env.BATSMAN1_ID,
    batsmanOnStrikeId: process.env.BATSMAN1_ID,
    batsmanNonStrikeId: process.env.BATSMAN2_ID,
    bowlerId: process.env.BOWLER_ID,
  }, TOKEN);

  assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  const innings = res.data.match.innings?.[ininningsIndex];
  assert.ok(innings, 'Response missing innings data');
  assert.strictEqual(innings.wickets, 1, `Expected wickets=1, got ${innings.wickets}`);
  const dismissed = innings.batting?.find(b => b.isOut);
  assert.ok(dismissed, 'No batsman marked as out');
  assert.strictEqual(dismissed.dismissalType, 'bowled', `Expected bowled, got ${dismissed.dismissalType}`);
  console.log('  ✓ Wicket recorded: wickets=1 type=bowled');
}

async function flow3_revertBall(ininningsIndex = 0) {
  console.log('\n─── Flow 3: Revert last ball ───');
  // First record a ball so we have something to revert
  const preRes = await req('POST', `/matches/${MATCH_ID}/score`, {
    inningsIndex,
    runs: 2,
    isWide: false,
    isNoBall: false,
    isWicket: false,
    batsmanOnStrikeId: process.env.BATSMAN1_ID,
    batsmanNonStrikeId: process.env.BATSMAN2_ID,
    bowlerId: process.env.BOWLER_ID,
  }, TOKEN);
  const preRuns = preRes.data.match.innings[ininningsIndex].runs;
  assert.strictEqual(preRuns > 0, true, 'Pre-revert record failed');

  const res = await req('POST', `/matches/${MATCH_ID}/revert-ball`, {
    inningsIndex,
  }, TOKEN);

  assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
  const innings = res.data.match.innings?.[ininningsIndex];
  assert.ok(innings, 'Response missing innings data');
  assert.strictEqual(innings.runs, preRuns - (2 + 0), `Expected runs=${preRuns - 2}, got ${innings.runs}`);
  const batsman = innings.batting?.[0];
  if (batsman) {
    assert.strictEqual(batsman.runs, 1, `Expected batsman runs=1 after revert, got ${batsman.runs}`);
  }
  console.log(`  ✓ Ball reverted: runs went from ${preRuns} back to ${innings.runs}`);
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== Scoring Flow Tests ===\n');

  const results = { pass: 0, fail: 0 };

  if (!TOKEN) {
    console.log('Authenticating…');
    await login();
    console.log('  ✓ Token obtained\n');
  }

  if (!MATCH_ID) {
    console.log('Setting up test data…');
    const team = await getFirstTeam();
    process.env.TEAM_ID = team._id || team.id;
    const players = await getFirstPlayers(process.env.TEAM_ID, 2);
    process.env.BATSMAN1_ID = players[0]._id || players[0].id;
    process.env.BATSMAN2_ID = players[1]._id || players[1].id;
    process.env.BOWLER_ID = players[1]._id || players[1].id;

    const match = await createMatch(process.env.TEAM_ID, [process.env.BATSMAN1_ID, process.env.BATSMAN2_ID]);
    MATCH_ID = match._id;
    console.log();
  }

  for (const flow of [flow1_recordRuns, flow2_recordWicket, flow3_revertBall]) {
    try {
      await flow(0);
      results.pass++;
    } catch (err) {
      results.fail++;
      console.log(`  ✗ ${flow.name}: ${err.message}`);
    }
  }

  console.log(`\n=== Results: ${results.pass} passed, ${results.fail} failed ===`);
  process.exit(results.fail ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
