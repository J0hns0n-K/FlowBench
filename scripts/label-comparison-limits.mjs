import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { makeReportComparison } from '../src/report-comparison-export.ts';

const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--write'), 'Use no arguments or --write.');
const fixturePath = 'data/label-comparison-twin-worlds-v1.json';
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
assert.equal(fixture.schemaVersion, 1);
assert.equal(fixture.provenance, 'synthetic');
assert.equal(fixture.construction, 'assistant-constructed-post-implementation-counterexamples');
assert.equal(fixture.worlds.length, 4);
assert.equal(new Set(fixture.worlds.map(world => world.id)).size, 4);

const sourceFiles = ['src/report-consistency.ts', 'src/report-comparison-export.ts', fixturePath, 'scripts/label-comparison-limits.mjs'];
const hash = createHash('sha256');
for (const file of sourceFiles) {
  hash.update(file); hash.update((await readFile(file, 'utf8')).replaceAll('\r\n', '\n'));
}
const sourceFingerprint = hash.digest('hex');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8',windowsHide:true}).trim();
const dirty = execFileSync('git', ['status', '--porcelain', '--', ...sourceFiles], {encoding:'utf8',windowsHide:true}).trim().length > 0;
const sourceRevision = revision + (dirty ? `+dirty:${sourceFingerprint.slice(0,12)}` : '');
const metadata = {generatedAt:new Date().toISOString(),sourceRevision,sourceFingerprint};

// The oracle's invented site IDs stay outside the two-argument text comparator.
const worlds = fixture.worlds.map(world => {
  assert.equal(typeof world.id, 'string');
  for (const key of ['first','second']) {
    assert.equal(typeof world.reports[key], 'string');
    assert.match(world.hypotheticalSites[key], /^SYNTHETIC_SITE_[AB]$/);
  }
  const comparison = makeReportComparison(world.reports.first, world.reports.second, metadata);
  assert.deepEqual({strict:comparison.result,alias:comparison.aliasComparison.result}, world.expectedTextResults);
  assert.equal(comparison.independentVerification, 'not-established');
  return {...world,hypotheticalSameSite:world.hypotheticalSites.first === world.hypotheticalSites.second,comparison};
});

const groups = new Map();
for (const world of worlds) {
  const key = JSON.stringify([world.reports.first, world.reports.second]);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(world);
}
assert.equal(groups.size, 2);
const witnesses = [...groups.values()].map(twins => {
  assert.equal(twins.length, 2);
  assert.deepEqual(twins[0].comparison, twins[1].comparison, 'Identical text must yield identical complete comparison records.');
  assert.deepEqual([...new Set(twins.map(world => world.hypotheticalSameSite))].sort(), [false,true]);
  return {worldIds:twins.map(world => world.id),visibleInputs:twins[0].reports,
    strictResult:twins[0].comparison.result,aliasResult:twins[0].comparison.aliasComparison.result,
    possibleSameSiteTruth:[false,true],siteTruthIdentifiedFromTheseReports:false};
});

const result = {schemaVersion:1,evaluationVersion:'label-site-identifiability-v1',provenance:'synthetic',
  construction:fixture.construction,...metadata,sourceFiles,fixturePath,worlds,witnesses,
  conclusion:'Identical visible reports admit same-site and different-site worlds; text comparison cannot identify site equality across these worlds.',
  empiricalAccuracy:null,independentVerification:'not-established',limitations:fixture.limitations};
const artifactPath = 'experiments/2026-11-18-label-limits-v1.json';
if (args[0] === '--write') {
  await mkdir('experiments', {recursive:true});
  await writeFile(artifactPath, JSON.stringify(result,null,2) + '\n');
} else {
  // Only run-specific clock/revision metadata may differ from the committed evidence.
  const comparable = value => {
    if (Array.isArray(value)) return value.map(comparable);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== 'generatedAt' && key !== 'sourceRevision')
      .map(([key,item]) => [key,comparable(item)]));
    return value;
  };
  const saved = JSON.parse(await readFile(artifactPath, 'utf8'));
  for (const world of saved.worlds) {
    assert.deepEqual(world.comparison, makeReportComparison(world.reports.first, world.reports.second,
      {generatedAt:saved.generatedAt,sourceRevision:saved.sourceRevision,sourceFingerprint:saved.sourceFingerprint}),
    'Saved comparison metadata/results must agree with the artifact root and retained raw inputs.');
  }
  assert.deepEqual(comparable(saved), comparable(result), 'Committed evidence is stale or inconsistent; review before --write.');
}
console.log(JSON.stringify({sourceRevision,sourceFingerprint,provenance:result.provenance,worldCount:worlds.length,
  indistinguishableInputGroups:witnesses.length,witnesses,empiricalAccuracy:null,conclusion:result.conclusion},null,2));
