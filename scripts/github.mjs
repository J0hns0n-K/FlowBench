// Uses the existing Git credential helper; never stores or prints credentials.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const base = '/repos/J0hns0n-K/FlowBench';
const [method = 'GET', endpoint = base, bodyPath] = process.argv.slice(2);
if (!['GET', 'POST', 'PATCH'].includes(method) ||
    !(endpoint === '/user' || endpoint === base || endpoint.startsWith(`${base}/`))) {
  throw new Error('Only this project and account identity are supported.');
}
const credential = spawnSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 30000,
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
  windowsHide: true,
});
const password = credential.stdout?.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
if (!password) throw new Error('No existing GitHub credential is available.');
const response = await fetch(`https://api.github.com${endpoint}`, {
  method,
  headers: { Authorization: `Bearer ${password}`, Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
  body: bodyPath ? await readFile(bodyPath, 'utf8') : undefined,
});
const data = await response.json();
if (!response.ok) throw new Error(`GitHub ${response.status}: ${data.message ?? 'request failed'}`);
function summary(item) {
  return Object.fromEntries(Object.entries(item).filter(([key]) => [
    'login', 'full_name', 'private', 'default_branch', 'permissions', 'html_url',
    'number', 'title', 'state', 'sha', 'has_issues', 'name', 'status', 'conclusion', 'head_sha', 'id',
  ].includes(key)));
}
console.log(JSON.stringify(Array.isArray(data) ? data.map(summary) :
  data.workflow_runs ? data.workflow_runs.map(summary) : summary(data), null, 2));
